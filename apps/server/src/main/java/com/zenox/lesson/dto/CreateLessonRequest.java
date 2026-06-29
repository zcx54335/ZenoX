package com.zenox.lesson.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CreateLessonRequest(
    Long classGroupId,
    String subject,
    String topic,
    @NotNull LocalDateTime startsAt,
    @NotNull LocalDateTime endsAt,
    BigDecimal lessonHours,
    BigDecimal unitPrice,
    String deliveryMode
) {
}
