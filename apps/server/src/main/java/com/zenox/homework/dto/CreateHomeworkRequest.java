package com.zenox.homework.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.time.LocalDateTime;

public record CreateHomeworkRequest(
    Long lessonId,
    Long classGroupId,
    List<Long> studentIds,
    @NotBlank String title,
    String content,
    LocalDateTime dueAt,
    Boolean publishNow
) {
}
