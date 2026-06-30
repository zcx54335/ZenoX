package com.zenox.question.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateQuestionInteractionRequest(
    @NotBlank @Size(max = 2000) String content
) {
}
