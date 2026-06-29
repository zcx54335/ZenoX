package com.zenox.classroom.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateClassGroupRequest(
    @NotBlank String name,
    String subject,
    String grade,
    String description
) {
}
