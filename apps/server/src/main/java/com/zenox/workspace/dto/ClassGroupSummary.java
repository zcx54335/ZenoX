package com.zenox.workspace.dto;

public record ClassGroupSummary(
    Long id,
    String name,
    String subject,
    String grade,
    String description,
    Integer studentCount,
    String teacherNames
) {
}
