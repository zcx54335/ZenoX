package com.zenox.classroom.dto;

public record ClassTeacherSummary(
    Long userId,
    String displayName,
    String role,
    String subject,
    String phone
) {
}
