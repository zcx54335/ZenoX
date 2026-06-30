package com.zenox.workspace.dto;

public record QuestionSummary(
    Long id,
    String title,
    String subject,
    String grade,
    String knowledgePoint,
    String difficulty,
    String content,
    String scope,
    String creatorName,
    Integer likeCount,
    Integer favoriteCount,
    Integer commentCount,
    Integer attachmentCount,
    Boolean likedByMe,
    Boolean favoriteByMe
) {
}
