package com.zenox.user.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateStudentRequest(
    @NotBlank String name,
    String grade,
    String school,
    String subject,
    String parentName,
    String parentPhone,
    Integer remainingLessons,
    String weaknessNote
) {
}
