package com.zenox.workspace.dto;

import java.time.LocalDateTime;

public record TodoSummary(
    String category,
    String label,
    String detail,
    String priority,
    LocalDateTime dueAt
) {
}
