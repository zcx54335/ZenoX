package com.zenox.lesson.dto;

import com.zenox.common.enums.LessonStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record LessonScheduleItem(
    Long id,
    Long classGroupId,
    String classGroupName,
    Long teacherUserId,
    String subject,
    String topic,
    LocalDateTime startsAt,
    LocalDateTime endsAt,
    BigDecimal lessonHours,
    BigDecimal unitPrice,
    String deliveryMode,
    LessonStatus status,
    Integer studentCount
) {
}
