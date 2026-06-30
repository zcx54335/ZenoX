package com.zenox.workspace.dto;

import java.time.LocalDateTime;

public record ClassRecordSummary(
    Long attendanceId,
    Long lessonId,
    Long studentId,
    String studentName,
    String classGroupName,
    String topic,
    String status,
    String teacherComment,
    LocalDateTime startsAt
) {
}
