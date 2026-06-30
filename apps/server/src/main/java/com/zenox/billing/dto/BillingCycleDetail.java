package com.zenox.billing.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record BillingCycleDetail(
    Long cycleId,
    Long studentId,
    String studentName,
    String parentName,
    String parentPhone,
    LocalDate cycleMonth,
    BigDecimal totalAmount,
    BigDecimal paidAmount,
    BigDecimal unpaidAmount,
    String status,
    Integer itemCount,
    List<BillingItemSummary> items,
    List<PaymentRecordSummary> payments
) {
  public static BillingCycleDetail from(BillingCycleHeader header, List<BillingItemSummary> items, List<PaymentRecordSummary> payments) {
    return new BillingCycleDetail(
        header.cycleId(),
        header.studentId(),
        header.studentName(),
        header.parentName(),
        header.parentPhone(),
        header.cycleMonth(),
        header.totalAmount(),
        header.paidAmount(),
        header.unpaidAmount(),
        header.status(),
        header.itemCount(),
        items,
        payments
    );
  }
}
