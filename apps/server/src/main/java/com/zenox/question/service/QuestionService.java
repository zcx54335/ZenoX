package com.zenox.question.service;

import com.baomidou.mybatisplus.core.toolkit.IdWorker;
import com.zenox.common.error.BusinessException;
import com.zenox.common.error.ErrorCode;
import com.zenox.common.security.CurrentUser;
import com.zenox.common.security.DataScope;
import com.zenox.common.security.DataScopeService;
import com.zenox.question.dto.CreateQuestionInteractionRequest;
import com.zenox.question.dto.CreateQuestionPostRequest;
import com.zenox.question.entity.Question;
import com.zenox.question.mapper.QuestionMapper;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class QuestionService {
  private final CurrentUser currentUser;
  private final DataScopeService dataScopeService;
  private final QuestionMapper questionMapper;

  public QuestionService(CurrentUser currentUser, DataScopeService dataScopeService, QuestionMapper questionMapper) {
    this.currentUser = currentUser;
    this.dataScopeService = dataScopeService;
    this.questionMapper = questionMapper;
  }

  @Transactional
  public Question createPost(CreateQuestionPostRequest request, List<MultipartFile> files) {
    List<MultipartFile> uploadFiles = normalizedFiles(files);
    List<String> fileNames = uploadFiles.stream().map(this::safeOriginalName).toList();
    String title = normalize(request.title());
    String content = normalize(request.content());
    if (!StringUtils.hasText(title) && !StringUtils.hasText(content) && fileNames.isEmpty()) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "Please add content or attachments first");
    }
    if (!StringUtils.hasText(title)) {
      title = content.length() > 28 ? content.substring(0, 28) : content;
    }
    if (!StringUtils.hasText(title)) {
      title = "New discussion";
    }

    Long tenantId = currentUser.tenantId();
    Long userId = currentUser.userId();
    Question question = new Question();
    question.setTenantId(tenantId);
    question.setCreatorUserId(userId);
    question.setTitle(title);
    question.setContent(content);
    question.setSubject(defaultText(request.subject(), "General"));
    question.setGrade(defaultText(request.grade(), "Unspecified"));
    question.setKnowledgePoint(fileNames.isEmpty() ? "Discussion" : String.join(", ", fileNames));
    question.setDifficulty("DISCUSSION");
    question.setScope(normalizeScope(request.scope()));
    questionMapper.insert(question);

    for (int index = 0; index < uploadFiles.size(); index += 1) {
      MultipartFile file = uploadFiles.get(index);
      String fileName = fileNames.get(index);
      questionMapper.insertQuestionAttachment(
          IdWorker.getId(),
          tenantId,
          question.getId(),
          userId,
          fileName,
          saveFile(question.getId(), fileName, file),
          contentType(file, fileName),
          file.getSize()
      );
    }
    return question;
  }

  @Transactional
  public void toggleReaction(Long questionId, String interactionType) {
    DataScope scope = dataScopeService.current();
    requireVisibleQuestion(scope, questionId);
    Long existingId = questionMapper.findActiveInteractionId(
        scope.getTenantId(),
        questionId,
        scope.getUserId(),
        interactionType
    );
    if (existingId != null) {
      questionMapper.softDeleteInteraction(scope.getTenantId(), existingId);
      return;
    }
    questionMapper.insertInteraction(
        IdWorker.getId(),
        scope.getTenantId(),
        questionId,
        scope.getUserId(),
        interactionType,
        null
    );
  }

  @Transactional
  public Long comment(Long questionId, CreateQuestionInteractionRequest request) {
    DataScope scope = dataScopeService.current();
    requireVisibleQuestion(scope, questionId);
    String content = normalize(request.content());
    if (!StringUtils.hasText(content)) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "Comment content is required");
    }
    Long commentId = IdWorker.getId();
    questionMapper.insertInteraction(
        commentId,
        scope.getTenantId(),
        questionId,
        scope.getUserId(),
        "COMMENT",
        content
    );
    return commentId;
  }

  private void requireVisibleQuestion(DataScope scope, Long questionId) {
    if (questionMapper.countVisibleQuestion(scope, questionId) == 0) {
      throw new BusinessException(ErrorCode.FORBIDDEN, "Question is not visible");
    }
  }

  private List<MultipartFile> normalizedFiles(List<MultipartFile> files) {
    if (files == null) {
      return List.of();
    }
    return files.stream()
        .filter(file -> file != null && !file.isEmpty())
        .limit(9)
        .toList();
  }

  private String normalize(String value) {
    return value == null ? "" : value.trim();
  }

  private String defaultText(String value, String fallback) {
    String normalized = normalize(value);
    return StringUtils.hasText(normalized) ? normalized : fallback;
  }

  private String normalizeScope(String value) {
    String normalized = normalize(value).toUpperCase();
    if ("PRIVATE".equals(normalized) || "CLASS".equals(normalized)) {
      return normalized;
    }
    return "PUBLIC";
  }

  private String safeOriginalName(MultipartFile file) {
    String originalName = normalize(file.getOriginalFilename());
    if (!StringUtils.hasText(originalName)) {
      return "attachment";
    }
    return Path.of(originalName).getFileName().toString();
  }

  private String saveFile(Long questionId, String fileName, MultipartFile file) {
    try {
      Path directory = Path.of("uploads", "question", String.valueOf(questionId));
      Files.createDirectories(directory);
      Path target = directory.resolve(fileName).normalize();
      Path root = directory.toAbsolutePath().normalize();
      Path absoluteTarget = target.toAbsolutePath().normalize();
      if (!absoluteTarget.startsWith(root)) {
        throw new BusinessException(ErrorCode.BAD_REQUEST, "Invalid attachment name");
      }
      file.transferTo(absoluteTarget);
      return target.toString().replace("\\", "/");
    } catch (IOException error) {
      throw new BusinessException(ErrorCode.INTERNAL_ERROR, "Failed to save attachment");
    }
  }

  private String contentType(MultipartFile file, String fileName) {
    if (StringUtils.hasText(file.getContentType())) {
      return file.getContentType();
    }
    String lower = fileName.toLowerCase();
    if (lower.endsWith(".png")) {
      return "image/png";
    }
    if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
      return "image/jpeg";
    }
    if (lower.endsWith(".gif")) {
      return "image/gif";
    }
    if (lower.endsWith(".pdf")) {
      return "application/pdf";
    }
    if (lower.endsWith(".docx")) {
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    }
    if (lower.endsWith(".xlsx")) {
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    }
    return "application/octet-stream";
  }
}
