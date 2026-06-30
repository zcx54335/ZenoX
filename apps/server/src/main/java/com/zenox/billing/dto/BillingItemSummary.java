package com.zenox.billing.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BillingItemSummary(
    Long id,
    Long lessonId,
    String title,
    BigDecimal amount,
    LocalDateTime lessonStartsAt,
    BigDecimal lessonHours,
    BigDecimal unitPrice
) {
}
