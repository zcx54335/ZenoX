package com.zenox.billing.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentRecordSummary(
    Long id,
    BigDecimal amount,
    LocalDateTime paidAt,
    String method,
    String note
) {
}
