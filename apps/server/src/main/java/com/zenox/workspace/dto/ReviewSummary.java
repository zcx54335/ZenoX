package com.zenox.workspace.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ReviewSummary(
    Long submissionId,
    Long homeworkId,
    Long studentId,
    String studentName,
    String homeworkTitle,
    String status,
    String mistakeTags,
    Boolean needsCorrection,
    Boolean excellent,
    String comment,
    BigDecimal score,
    LocalDateTime submittedAt,
    LocalDateTime reviewedAt
) {
}
