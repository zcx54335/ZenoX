package com.zenox.user.dto;

public record TeacherProfileSummary(
    Long userId,
    Long profileId,
    String username,
    String displayName,
    String role,
    String subject,
    String phone,
    String bio,
    String classNames
) {
}
