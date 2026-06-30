package com.zenox.question.dto;

import jakarta.validation.constraints.Size;
import java.util.List;

public record CreateQuestionPostRequest(
    @Size(max = 255) String title,
    @Size(max = 64) String subject,
    @Size(max = 32) String grade,
    @Size(max = 32) String scope,
    String content,
    List<@Size(max = 255) String> fileNames
) {
}
