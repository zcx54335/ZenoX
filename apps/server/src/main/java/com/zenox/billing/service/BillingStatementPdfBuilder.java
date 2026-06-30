package com.zenox.billing.service;

import com.zenox.billing.dto.BillingCycleDetail;
import com.zenox.billing.dto.BillingItemSummary;
import com.zenox.billing.dto.PaymentRecordSummary;
import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Graphics2D;
import java.awt.GraphicsEnvironment;
import java.awt.RenderingHints;
import java.awt.geom.RoundRectangle2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import javax.imageio.ImageIO;

final class BillingStatementPdfBuilder {
  private static final int IMAGE_WIDTH = 1240;
  private static final int IMAGE_HEIGHT = 1754;
  private static final int PAGE_WIDTH = 595;
  private static final int PAGE_HEIGHT = 842;
  private static final int MARGIN = 72;
  private static final int CONTENT_BOTTOM = IMAGE_HEIGHT - 126;
  private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("yyyy-MM-dd");
  private static final DateTimeFormatter DATE_TIME = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
  private static final String FONT_FAMILY = preferredFontFamily();

  private BillingStatementPdfBuilder() {
  }

  static byte[] build(BillingCycleDetail detail) {
    List<BufferedImage> pages = renderPages(detail);
    try {
      return imagePdf(pages);
    } catch (IOException exception) {
      throw new IllegalStateException("Billing statement PDF generation failed", exception);
    }
  }

  private static List<BufferedImage> renderPages(BillingCycleDetail detail) {
    List<BufferedImage> pages = new ArrayList<>();
    Page page = new Page(detail, 1);
    pages.add(page.image);
    int y = page.drawOpening();

    y = drawSectionTitle(page.graphics, "课程明细", "根据已完成课程自动生成", y);
    if (detail.items().isEmpty()) {
      y = drawEmptyRow(page.graphics, "暂无课程明细", y);
    } else {
      for (BillingItemSummary item : detail.items()) {
        if (y + 86 > CONTENT_BOTTOM) {
          page.drawFooter();
          page = new Page(detail, pages.size() + 1);
          pages.add(page.image);
          y = page.drawContinuation("课程明细");
        }
        y = drawLessonRow(page.graphics, item, y);
      }
    }

    if (y + 160 > CONTENT_BOTTOM) {
      page.drawFooter();
      page = new Page(detail, pages.size() + 1);
      pages.add(page.image);
      y = page.drawContinuation("收款记录");
    } else {
      y += 22;
      y = drawSectionTitle(page.graphics, "收款记录", "家长付款后实时更新账单状态", y);
    }

    if (detail.payments().isEmpty()) {
      y = drawEmptyRow(page.graphics, "暂无收款记录", y);
    } else {
      for (PaymentRecordSummary payment : detail.payments()) {
        if (y + 78 > CONTENT_BOTTOM) {
          page.drawFooter();
          page = new Page(detail, pages.size() + 1);
          pages.add(page.image);
          y = page.drawContinuation("收款记录");
        }
        y = drawPaymentRow(page.graphics, payment, y);
      }
    }
    page.drawFooter();
    return pages;
  }

  private static int drawSectionTitle(Graphics2D graphics, String title, String subtitle, int y) {
    graphics.setFont(font(Font.BOLD, 28));
    graphics.setColor(ink());
    graphics.drawString(title, MARGIN, y);
    graphics.setFont(font(Font.PLAIN, 18));
    graphics.setColor(muted());
    graphics.drawString(subtitle, MARGIN, y + 30);
    return y + 58;
  }

  private static int drawLessonRow(Graphics2D graphics, BillingItemSummary item, int y) {
    drawCard(graphics, MARGIN, y, IMAGE_WIDTH - MARGIN * 2, 72, 28, new Color(255, 255, 255, 190), new Color(210, 224, 255, 120));
    String time = item.lessonStartsAt() == null ? "手动明细" : item.lessonStartsAt().format(DATE_TIME);
    graphics.setFont(font(Font.BOLD, 20));
    graphics.setColor(ink());
    drawClippedText(graphics, item.title(), MARGIN + 26, y + 30, 780);
    graphics.setFont(font(Font.PLAIN, 16));
    graphics.setColor(muted());
    String meta = time + "  |  " + decimal(item.lessonHours()) + " 课时  |  单价 " + yuan(item.unitPrice());
    drawClippedText(graphics, meta, MARGIN + 26, y + 55, 780);
    graphics.setFont(font(Font.BOLD, 24));
    graphics.setColor(accent());
    drawRightText(graphics, yuan(item.amount()), IMAGE_WIDTH - MARGIN - 26, y + 43);
    return y + 86;
  }

  private static int drawPaymentRow(Graphics2D graphics, PaymentRecordSummary payment, int y) {
    drawCard(graphics, MARGIN, y, IMAGE_WIDTH - MARGIN * 2, 66, 26, new Color(255, 255, 255, 180), new Color(226, 235, 255, 100));
    graphics.setFont(font(Font.BOLD, 20));
    graphics.setColor(ink());
    graphics.drawString(paymentMethod(payment.method()) + "  " + yuan(payment.amount()), MARGIN + 26, y + 30);
    graphics.setFont(font(Font.PLAIN, 16));
    graphics.setColor(muted());
    String note = payment.paidAt().format(DATE_TIME) + "  |  " + blank(payment.note(), "无备注");
    drawClippedText(graphics, note, MARGIN + 26, y + 54, 770);
    return y + 78;
  }

  private static int drawEmptyRow(Graphics2D graphics, String text, int y) {
    drawCard(graphics, MARGIN, y, IMAGE_WIDTH - MARGIN * 2, 78, 28, new Color(255, 255, 255, 150), new Color(226, 235, 255, 90));
    graphics.setFont(font(Font.PLAIN, 18));
    graphics.setColor(muted());
    graphics.drawString(text, MARGIN + 26, y + 45);
    return y + 96;
  }

  private static final class Page {
    private final BillingCycleDetail detail;
    private final Graphics2D graphics;
    private final BufferedImage image;
    private final int pageNumber;

    private Page(BillingCycleDetail detail, int pageNumber) {
      this.detail = detail;
      this.pageNumber = pageNumber;
      image = new BufferedImage(IMAGE_WIDTH, IMAGE_HEIGHT, BufferedImage.TYPE_INT_RGB);
      graphics = image.createGraphics();
      graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
      graphics.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
      drawBackground();
      drawBrandHeader();
    }

    private int drawOpening() {
      graphics.setFont(font(Font.BOLD, 64));
      graphics.setColor(ink());
      graphics.drawString("学生月结单", MARGIN, 256);
      graphics.setFont(font(Font.PLAIN, 22));
      graphics.setColor(muted());
      graphics.drawString("本月课程、课时与收款汇总，方便家长核对与留存。", MARGIN, 300);

      drawStatusPill(graphics, billingStatus(detail.status()), IMAGE_WIDTH - MARGIN - 190, 232, 190, 52);
      drawStudentCard();
      drawMetricCards();
      return 662;
    }

    private int drawContinuation(String section) {
      graphics.setFont(font(Font.BOLD, 42));
      graphics.setColor(ink());
      graphics.drawString("月结单续页", MARGIN, 242);
      graphics.setFont(font(Font.PLAIN, 20));
      graphics.setColor(muted());
      graphics.drawString(detail.studentName() + " · " + detail.cycleMonth().format(DateTimeFormatter.ofPattern("yyyy-MM")), MARGIN, 278);
      return drawSectionTitle(graphics, section, "延续上一页内容", 356);
    }

    private void drawBackground() {
      graphics.setColor(new Color(245, 248, 255));
      graphics.fillRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
      graphics.setColor(new Color(84, 112, 255, 42));
      graphics.fillOval(IMAGE_WIDTH - 420, -160, 520, 520);
      graphics.setColor(new Color(122, 229, 255, 36));
      graphics.fillOval(-190, 260, 460, 460);
      graphics.setColor(new Color(255, 122, 205, 30));
      graphics.fillOval(730, 1180, 560, 560);
      graphics.setColor(new Color(210, 220, 245, 70));
      graphics.setStroke(new BasicStroke(1.5f));
      graphics.drawRoundRect(34, 34, IMAGE_WIDTH - 68, IMAGE_HEIGHT - 68, 54, 54);
    }

    private void drawBrandHeader() {
      drawCard(graphics, MARGIN, 70, 78, 78, 28, new Color(255, 255, 255, 205), new Color(160, 181, 255, 120));
      graphics.setFont(font(Font.BOLD, 36));
      graphics.setColor(accent());
      graphics.drawString("Z", MARGIN + 27, 121);
      graphics.setFont(font(Font.BOLD, 30));
      graphics.setColor(ink());
      graphics.drawString("ZenoX", MARGIN + 98, 104);
      graphics.setFont(font(Font.PLAIN, 17));
      graphics.setColor(muted());
      graphics.drawString("赵辰雄教学工作室 · Tutor SaaS Workspace", MARGIN + 98, 134);
      graphics.setFont(font(Font.PLAIN, 16));
      graphics.setColor(muted());
      drawRightText(graphics, "生成日期 " + LocalDate.now().format(DATE), IMAGE_WIDTH - MARGIN, 116);
    }

    private void drawStudentCard() {
      drawCard(graphics, MARGIN, 344, IMAGE_WIDTH - MARGIN * 2, 118, 36, new Color(255, 255, 255, 185), new Color(200, 216, 255, 120));
      graphics.setFont(font(Font.BOLD, 28));
      graphics.setColor(ink());
      graphics.drawString(detail.studentName(), MARGIN + 30, 394);
      graphics.setFont(font(Font.PLAIN, 18));
      graphics.setColor(muted());
      graphics.drawString("账单月份 " + detail.cycleMonth().format(DateTimeFormatter.ofPattern("yyyy年MM月")), MARGIN + 30, 428);
      graphics.drawString("家长 " + blank(detail.parentName(), "未填写") + "  |  电话 " + blank(detail.parentPhone(), "未填写"), MARGIN + 420, 394);
      graphics.drawString("账单编号 " + detail.cycleId(), MARGIN + 420, 428);
    }

    private void drawMetricCards() {
      int cardWidth = (IMAGE_WIDTH - MARGIN * 2 - 28) / 3;
      drawMetric("应收金额", yuan(detail.totalAmount()), MARGIN, 492, cardWidth, new Color(84, 112, 255));
      drawMetric("已收金额", yuan(detail.paidAmount()), MARGIN + cardWidth + 14, 492, cardWidth, new Color(20, 170, 120));
      drawMetric("待收金额", yuan(detail.unpaidAmount()), MARGIN + (cardWidth + 14) * 2, 492, cardWidth, new Color(226, 82, 160));
    }

    private void drawMetric(String label, String amount, int x, int y, int width, Color color) {
      drawCard(graphics, x, y, width, 118, 34, new Color(255, 255, 255, 190), new Color(color.getRed(), color.getGreen(), color.getBlue(), 50));
      graphics.setFont(font(Font.PLAIN, 18));
      graphics.setColor(muted());
      graphics.drawString(label, x + 26, y + 38);
      graphics.setFont(font(Font.BOLD, 34));
      graphics.setColor(color);
      graphics.drawString(amount, x + 26, y + 86);
    }

    private void drawFooter() {
      graphics.setFont(font(Font.PLAIN, 15));
      graphics.setColor(new Color(101, 113, 137));
      graphics.drawString("本月结单由 ZenoX 自动生成，课程明细以系统完成记录为准。", MARGIN, IMAGE_HEIGHT - 76);
      drawRightText(graphics, "Page " + pageNumber, IMAGE_WIDTH - MARGIN, IMAGE_HEIGHT - 76);
      graphics.dispose();
    }
  }

  private static void drawCard(Graphics2D graphics, int x, int y, int width, int height, int arc, Color fill, Color border) {
    graphics.setColor(fill);
    graphics.fill(new RoundRectangle2D.Double(x, y, width, height, arc, arc));
    graphics.setStroke(new BasicStroke(1.8f));
    graphics.setColor(border);
    graphics.draw(new RoundRectangle2D.Double(x, y, width, height, arc, arc));
  }

  private static void drawStatusPill(Graphics2D graphics, String text, int x, int y, int width, int height) {
    graphics.setColor(new Color(17, 24, 39));
    graphics.fillRoundRect(x, y, width, height, height, height);
    graphics.setFont(font(Font.BOLD, 18));
    graphics.setColor(Color.WHITE);
    drawCenteredText(graphics, text, x, y + 2, width, height);
  }

  private static void drawCenteredText(Graphics2D graphics, String text, int x, int y, int width, int height) {
    FontMetrics metrics = graphics.getFontMetrics();
    int textX = x + (width - metrics.stringWidth(text)) / 2;
    int textY = y + ((height - metrics.getHeight()) / 2) + metrics.getAscent();
    graphics.drawString(text, textX, textY);
  }

  private static void drawRightText(Graphics2D graphics, String text, int right, int baseline) {
    FontMetrics metrics = graphics.getFontMetrics();
    graphics.drawString(text, right - metrics.stringWidth(text), baseline);
  }

  private static void drawClippedText(Graphics2D graphics, String text, int x, int baseline, int maxWidth) {
    String value = blank(text, "");
    FontMetrics metrics = graphics.getFontMetrics();
    if (metrics.stringWidth(value) <= maxWidth) {
      graphics.drawString(value, x, baseline);
      return;
    }
    String ellipsis = "...";
    while (!value.isEmpty() && metrics.stringWidth(value + ellipsis) > maxWidth) {
      value = value.substring(0, value.length() - 1);
    }
    graphics.drawString(value + ellipsis, x, baseline);
  }

  private static Font font(int style, int size) {
    return new Font(FONT_FAMILY, style, size);
  }

  private static Color ink() {
    return new Color(15, 23, 42);
  }

  private static Color muted() {
    return new Color(92, 106, 132);
  }

  private static Color accent() {
    return new Color(84, 112, 255);
  }

  private static String yuan(BigDecimal amount) {
    return "¥" + (amount == null ? BigDecimal.ZERO : amount).setScale(2, RoundingMode.HALF_UP).toPlainString();
  }

  private static String decimal(BigDecimal amount) {
    return (amount == null ? BigDecimal.ZERO : amount).stripTrailingZeros().toPlainString();
  }

  private static String blank(String value, String fallback) {
    return value == null || value.isBlank() ? fallback : value.trim();
  }

  private static String paymentMethod(String method) {
    return switch (blank(method, "WECHAT")) {
      case "ALIPAY" -> "支付宝";
      case "BANK" -> "银行卡";
      case "CASH" -> "现金";
      case "WECHAT" -> "微信";
      default -> method;
    };
  }

  private static String billingStatus(String status) {
    return switch (blank(status, "DRAFT")) {
      case "PAID" -> "已结清";
      case "PARTIALLY_PAID" -> "部分收款";
      case "CONFIRMED" -> "已确认";
      case "PENDING_CONFIRMATION" -> "待确认";
      case "CANCELLED" -> "已取消";
      default -> "待收款";
    };
  }

  private static String preferredFontFamily() {
    List<String> preferred = List.of(
        "PingFang SC",
        "Hiragino Sans GB",
        "Microsoft YaHei",
        "Noto Sans CJK SC",
        "STHeiti",
        "Arial Unicode MS",
        "SansSerif"
    );
    List<String> available = List.of(GraphicsEnvironment.getLocalGraphicsEnvironment().getAvailableFontFamilyNames());
    for (String family : preferred) {
      if (available.contains(family)) {
        return family;
      }
    }
    return Font.SANS_SERIF;
  }

  private static byte[] imagePdf(List<BufferedImage> pages) throws IOException {
    List<byte[]> images = new ArrayList<>();
    for (BufferedImage page : pages) {
      ByteArrayOutputStream imageOutput = new ByteArrayOutputStream();
      ImageIO.write(page, "jpg", imageOutput);
      images.add(imageOutput.toByteArray());
    }

    ByteArrayOutputStream output = new ByteArrayOutputStream();
    write(output, ascii("%PDF-1.4\n"));
    List<Integer> offsets = new ArrayList<>();
    int objectCount = 2 + pages.size() * 3;
    writeObject(output, offsets, "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

    StringBuilder kids = new StringBuilder();
    for (int index = 0; index < pages.size(); index++) {
      kids.append(pageObjectNumber(index)).append(" 0 R ");
    }
    writeObject(output, offsets, "2 0 obj\n<< /Type /Pages /Kids [" + kids + "] /Count " + pages.size() + " >>\nendobj\n");

    for (int index = 0; index < pages.size(); index++) {
      int pageObject = pageObjectNumber(index);
      int contentObject = contentObjectNumber(index);
      int imageObject = imageObjectNumber(index);
      writeObject(output, offsets, pageObject + " 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + PAGE_WIDTH + " " + PAGE_HEIGHT + "] /Resources << /XObject << /Im" + index + " " + imageObject + " 0 R >> >> /Contents " + contentObject + " 0 R >>\nendobj\n");
      String content = "q\n" + PAGE_WIDTH + " 0 0 " + PAGE_HEIGHT + " 0 0 cm\n/Im" + index + " Do\nQ\n";
      writeObject(output, offsets, contentObject + " 0 obj\n<< /Length " + ascii(content).length + " >>\nstream\n" + content + "endstream\nendobj\n");
      byte[] image = images.get(index);
      offsets.add(output.size());
      write(output, ascii(imageObject + " 0 obj\n<< /Type /XObject /Subtype /Image /Width " + IMAGE_WIDTH + " /Height " + IMAGE_HEIGHT + " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " + image.length + " >>\nstream\n"));
      write(output, image);
      write(output, ascii("\nendstream\nendobj\n"));
    }

    int xrefOffset = output.size();
    write(output, ascii("xref\n0 " + (objectCount + 1) + "\n"));
    write(output, ascii("0000000000 65535 f \n"));
    for (Integer offset : offsets) {
      write(output, ascii(String.format("%010d 00000 n \n", offset)));
    }
    write(output, ascii("trailer\n<< /Size " + (objectCount + 1) + " /Root 1 0 R >>\nstartxref\n" + xrefOffset + "\n%%EOF\n"));
    return output.toByteArray();
  }

  private static int pageObjectNumber(int index) {
    return 3 + index * 3;
  }

  private static int contentObjectNumber(int index) {
    return 4 + index * 3;
  }

  private static int imageObjectNumber(int index) {
    return 5 + index * 3;
  }

  private static void writeObject(ByteArrayOutputStream output, List<Integer> offsets, String object) {
    offsets.add(output.size());
    write(output, ascii(object));
  }

  private static byte[] ascii(String value) {
    return value.getBytes(StandardCharsets.ISO_8859_1);
  }

  private static void write(ByteArrayOutputStream output, byte[] bytes) {
    output.write(bytes, 0, bytes.length);
  }
}
