package com.zenox.billing.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record RecordPaymentRequest(
    @NotNull @DecimalMin(value = "0.01") BigDecimal amount,
    LocalDateTime paidAt,
    String method,
    String note
) {
}
