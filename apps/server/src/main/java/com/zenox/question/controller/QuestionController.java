package com.zenox.question.controller;

import com.zenox.auth.security.RequirePermission;
import com.zenox.common.api.ApiResponse;
import com.zenox.question.dto.CreateQuestionInteractionRequest;
import com.zenox.question.dto.CreateQuestionPostRequest;
import com.zenox.question.entity.Question;
import com.zenox.question.service.QuestionService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {
  private final QuestionService questionService;

  public QuestionController(QuestionService questionService) {
    this.questionService = questionService;
  }

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @RequirePermission("question:create")
  public ApiResponse<Question> createPost(
      @Valid @RequestPart("payload") CreateQuestionPostRequest request,
      @RequestPart(value = "files", required = false) List<MultipartFile> files
  ) {
    return ApiResponse.ok(questionService.createPost(request, files));
  }

  @PostMapping("/{questionId}/like")
  @RequirePermission("question:view")
  public ApiResponse<Void> toggleLike(@PathVariable Long questionId) {
    questionService.toggleReaction(questionId, "LIKE");
    return ApiResponse.ok();
  }

  @PostMapping("/{questionId}/favorite")
  @RequirePermission("question:view")
  public ApiResponse<Void> toggleFavorite(@PathVariable Long questionId) {
    questionService.toggleReaction(questionId, "FAVORITE");
    return ApiResponse.ok();
  }

  @PostMapping("/{questionId}/comments")
  @RequirePermission("question:view")
  public ApiResponse<Long> comment(
      @PathVariable Long questionId,
      @Valid @RequestBody CreateQuestionInteractionRequest request
  ) {
    return ApiResponse.ok(questionService.comment(questionId, request));
  }
}
