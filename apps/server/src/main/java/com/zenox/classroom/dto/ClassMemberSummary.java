package com.zenox.classroom.dto;

import java.math.BigDecimal;

public record ClassMemberSummary(
    Long id,
    String name,
    String grade,
    String subject,
    String parentName,
    String parentPhone,
    BigDecimal remainingLessons,
    String weaknessNote,
    String classNames
) {
}
