package com.zenox.workspace.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record BillingSummary(
    Long cycleId,
    Long studentId,
    String studentName,
    LocalDate cycleMonth,
    BigDecimal totalAmount,
    BigDecimal paidAmount,
    BigDecimal unpaidAmount,
    String status,
    Integer itemCount
) {
}
