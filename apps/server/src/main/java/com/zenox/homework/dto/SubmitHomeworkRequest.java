package com.zenox.homework.dto;

import jakarta.validation.constraints.NotBlank;

public record SubmitHomeworkRequest(
    Long studentId,
    @NotBlank String content
) {
}
