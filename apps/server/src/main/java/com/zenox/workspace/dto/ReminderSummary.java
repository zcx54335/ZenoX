package com.zenox.workspace.dto;

import java.time.LocalDateTime;

public record ReminderSummary(
    Long id,
    String category,
    String title,
    String content,
    LocalDateTime scheduledAt,
    String status,
    String channel
) {
}
