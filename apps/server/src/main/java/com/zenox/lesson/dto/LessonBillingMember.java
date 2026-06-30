package com.zenox.lesson.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record LessonBillingMember(
    Long studentId,
    String classGroupName,
    String subject,
    String topic,
    LocalDateTime startsAt,
    BigDecimal lessonHours,
    BigDecimal unitPrice
) {
}
