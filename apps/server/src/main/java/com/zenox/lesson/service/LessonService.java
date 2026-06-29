package com.zenox.lesson.service;

import com.zenox.common.enums.LessonStatus;
import com.zenox.common.error.BusinessException;
import com.zenox.common.error.ErrorCode;
import com.zenox.common.security.CurrentUser;
import com.zenox.lesson.dto.CreateLessonRequest;
import com.zenox.lesson.dto.LessonScheduleItem;
import com.zenox.lesson.dto.RescheduleLessonRequest;
import com.zenox.lesson.entity.Lesson;
import com.zenox.lesson.mapper.LessonMapper;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LessonService {
  private final CurrentUser currentUser;
  private final LessonMapper lessonMapper;

  public LessonService(CurrentUser currentUser, LessonMapper lessonMapper) {
    this.currentUser = currentUser;
    this.lessonMapper = lessonMapper;
  }

  public List<LessonScheduleItem> list() {
    return lessonMapper.listScheduleByTenantId(currentUser.tenantId());
  }

  public byte[] exportMonthlyLessons(YearMonth month) {
    var startsAt = month.atDay(1).atStartOfDay();
    var endsAt = month.plusMonths(1).atDay(1).atStartOfDay();
    List<LessonScheduleItem> lessons = lessonMapper.listScheduleByTenantIdAndRange(currentUser.tenantId(), startsAt, endsAt);
    try (var workbook = new XSSFWorkbook(); var output = new ByteArrayOutputStream()) {
      var sheet = workbook.createSheet(month + " 课程记录");
      CellStyle headerStyle = workbook.createCellStyle();
      Font headerFont = workbook.createFont();
      headerFont.setBold(true);
      headerStyle.setFont(headerFont);

      String[] headers = {"日期", "开始", "结束", "班级/学生", "人数", "科目", "课程主题", "课时", "单价", "金额", "上课方式", "状态"};
      Row header = sheet.createRow(0);
      for (int index = 0; index < headers.length; index++) {
        var cell = header.createCell(index);
        cell.setCellValue(headers[index]);
        cell.setCellStyle(headerStyle);
      }

      DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
      DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
      int rowIndex = 1;
      for (LessonScheduleItem lesson : lessons) {
        Row row = sheet.createRow(rowIndex++);
        BigDecimal hours = lesson.lessonHours() == null ? BigDecimal.ZERO : lesson.lessonHours();
        BigDecimal unitPrice = lesson.unitPrice() == null ? BigDecimal.ZERO : lesson.unitPrice();
        BigDecimal amount = hours.multiply(unitPrice).setScale(2, RoundingMode.HALF_UP);
        row.createCell(0).setCellValue(lesson.startsAt().toLocalDate().format(dateFormatter));
        row.createCell(1).setCellValue(lesson.startsAt().toLocalTime().format(timeFormatter));
        row.createCell(2).setCellValue(lesson.endsAt().toLocalTime().format(timeFormatter));
        row.createCell(3).setCellValue(lesson.classGroupName() == null ? "未绑定班级" : lesson.classGroupName());
        row.createCell(4).setCellValue(lesson.studentCount() == null ? 0 : lesson.studentCount());
        row.createCell(5).setCellValue(lesson.subject() == null ? "" : lesson.subject());
        row.createCell(6).setCellValue(lesson.topic() == null ? "" : lesson.topic());
        row.createCell(7).setCellValue(hours.doubleValue());
        row.createCell(8).setCellValue(unitPrice.doubleValue());
        row.createCell(9).setCellValue(amount.doubleValue());
        row.createCell(10).setCellValue(lesson.deliveryMode() == null ? "" : lesson.deliveryMode());
        row.createCell(11).setCellValue(lesson.status() == null ? "" : lesson.status().name());
      }

      for (int index = 0; index < headers.length; index++) {
        sheet.autoSizeColumn(index);
      }
      workbook.write(output);
      return output.toByteArray();
    } catch (IOException exception) {
      throw new BusinessException(ErrorCode.INTERNAL_ERROR, "Excel export failed");
    }
  }

  @Transactional
  public Lesson create(CreateLessonRequest request) {
    if (!request.endsAt().isAfter(request.startsAt())) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "Lesson end time must be after start time");
    }
    Long userId = currentUser.userId();
    Long tenantId = currentUser.tenantId();
    ensureNoConflicts(tenantId, userId, request.classGroupId(), request.startsAt(), request.endsAt(), null);

    Lesson lesson = new Lesson();
    lesson.setTenantId(tenantId);
    lesson.setTeacherUserId(userId);
    lesson.setClassGroupId(request.classGroupId());
    lesson.setSubject(request.subject());
    lesson.setTopic(request.topic());
    lesson.setStartsAt(request.startsAt());
    lesson.setEndsAt(request.endsAt());
    lesson.setLessonHours(request.lessonHours() == null ? BigDecimal.ONE : request.lessonHours());
    lesson.setUnitPrice(request.unitPrice() == null ? BigDecimal.ZERO : request.unitPrice());
    lesson.setDeliveryMode(request.deliveryMode() == null ? "ONLINE" : request.deliveryMode());
    lesson.setStatus(LessonStatus.SCHEDULED);
    lessonMapper.insert(lesson);
    return lesson;
  }

  @Transactional
  public Lesson reschedule(Long id, RescheduleLessonRequest request) {
    if (!request.endsAt().isAfter(request.startsAt())) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "Lesson end time must be after start time");
    }
    Long tenantId = currentUser.tenantId();
    Lesson lesson = lessonMapper.findByIdAndTenantId(id, tenantId);
    if (lesson == null) {
      throw new BusinessException(ErrorCode.NOT_FOUND, "Lesson not found");
    }
    if (lesson.getStatus() == LessonStatus.CANCELLED) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "Cancelled lessons cannot be rescheduled");
    }
    ensureNoConflicts(tenantId, lesson.getTeacherUserId(), lesson.getClassGroupId(), request.startsAt(), request.endsAt(), id);
    lesson.setStartsAt(request.startsAt());
    lesson.setEndsAt(request.endsAt());
    lesson.setStatus(LessonStatus.SCHEDULED);
    lessonMapper.updateById(lesson);
    return lesson;
  }

  @Transactional
  public Lesson cancel(Long id) {
    Long tenantId = currentUser.tenantId();
    Lesson lesson = lessonMapper.findByIdAndTenantId(id, tenantId);
    if (lesson == null) {
      throw new BusinessException(ErrorCode.NOT_FOUND, "Lesson not found");
    }
    lesson.setStatus(LessonStatus.CANCELLED);
    lessonMapper.updateById(lesson);
    return lesson;
  }

  private void ensureNoConflicts(
      Long tenantId,
      Long teacherUserId,
      Long classGroupId,
      java.time.LocalDateTime startsAt,
      java.time.LocalDateTime endsAt,
      Long excludedLessonId
  ) {
    if (lessonMapper.countTeacherConflicts(tenantId, teacherUserId, startsAt, endsAt, excludedLessonId) > 0) {
      throw new BusinessException(ErrorCode.CONFLICT, "老师在这个时间段已经有课程");
    }
    if (classGroupId == null) {
      return;
    }
    if (lessonMapper.countClassConflicts(tenantId, classGroupId, startsAt, endsAt, excludedLessonId) > 0) {
      throw new BusinessException(ErrorCode.CONFLICT, "这个班级在该时间段已经有课程");
    }
    if (lessonMapper.countStudentConflicts(tenantId, classGroupId, startsAt, endsAt, excludedLessonId) > 0) {
      throw new BusinessException(ErrorCode.CONFLICT, "该班级中有学生在这个时间段已经被安排到其他课程");
    }
  }
}
