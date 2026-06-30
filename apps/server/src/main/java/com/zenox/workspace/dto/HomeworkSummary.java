package com.zenox.workspace.dto;

import java.time.LocalDateTime;

public record HomeworkSummary(
    Long id,
    Long lessonId,
    Long studentId,
    String studentName,
    String classGroupName,
    String title,
    String content,
    LocalDateTime dueAt,
    String status,
    Integer submissionCount,
    Integer reviewCount,
    Integer attachmentCount
) {
}
