package com.zenox.billing.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record BillingCycleHeader(
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
    Integer itemCount
) {
}
