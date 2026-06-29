package com.zenox.lesson.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record RescheduleLessonRequest(
    @NotNull LocalDateTime startsAt,
    @NotNull LocalDateTime endsAt
) {
}
