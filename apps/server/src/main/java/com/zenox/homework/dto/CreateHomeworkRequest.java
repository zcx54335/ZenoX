package com.zenox.homework.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public record CreateHomeworkRequest(
    Long lessonId,
    @NotBlank String title,
    String content,
    LocalDateTime dueAt,
    Boolean publishNow
) {
}
