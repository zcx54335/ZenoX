package com.zenox.workspace.dto;

import java.math.BigDecimal;

public record StudentSummary(
    Long id,
    String name,
    String grade,
    String school,
    String subject,
    String parentName,
    String parentPhone,
    BigDecimal remainingLessons,
    String weaknessNote,
    String classNames
) {
}
