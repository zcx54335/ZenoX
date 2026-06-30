package com.zenox.user.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateTeacherRequest(
    @NotBlank String username,
    @NotBlank String displayName,
    String subject,
    String phone,
    String bio,
    String password
) {
}
