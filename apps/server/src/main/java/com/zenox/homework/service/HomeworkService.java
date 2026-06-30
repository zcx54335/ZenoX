package com.zenox.homework.service;

import com.baomidou.mybatisplus.core.toolkit.IdWorker;
import com.zenox.common.enums.HomeworkStatus;
import com.zenox.common.error.BusinessException;
import com.zenox.common.error.ErrorCode;
import com.zenox.common.security.CurrentUser;
import com.zenox.common.security.DataScope;
import com.zenox.common.security.DataScopeService;
import com.zenox.homework.dto.CreateHomeworkRequest;
import com.zenox.homework.dto.ReviewHomeworkRequest;
import com.zenox.homework.dto.SubmitHomeworkRequest;
import com.zenox.homework.entity.Homework;
import com.zenox.homework.mapper.HomeworkMapper;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class HomeworkService {
  private final CurrentUser currentUser;
  private final DataScopeService dataScopeService;
  private final HomeworkMapper homeworkMapper;

  public HomeworkService(CurrentUser currentUser, DataScopeService dataScopeService, HomeworkMapper homeworkMapper) {
    this.currentUser = currentUser;
    this.dataScopeService = dataScopeService;
    this.homeworkMapper = homeworkMapper;
  }

  public List<Homework> list() {
    return homeworkMapper.listByScope(dataScopeService.current());
  }

  @Transactional
  public Homework create(CreateHomeworkRequest request) {
    DataScope scope = dataScopeService.current();
    Homework homework = new Homework();
    homework.setTenantId(currentUser.tenantId());
    homework.setTeacherUserId(currentUser.userId());
    homework.setLessonId(request.lessonId());
    homework.setTitle(request.title());
    homework.setContent(request.content());
    homework.setDueAt(request.dueAt());
    homework.setStatus(Boolean.TRUE.equals(request.publishNow()) ? HomeworkStatus.PUBLISHED : HomeworkStatus.DRAFT);
    homeworkMapper.insert(homework);
    for (Long studentId : resolveTargetStudentIds(scope, request)) {
      homeworkMapper.insertVisibility(IdWorker.getId(), currentUser.tenantId(), homework.getId(), studentId);
    }
    return homework;
  }

  @Transactional
  public Long submit(Long homeworkId, SubmitHomeworkRequest request) {
    Long tenantId = currentUser.tenantId();
    DataScope scope = dataScopeService.current();
    Homework homework = requireHomework(homeworkId, tenantId);
    Long studentId = resolveSubmitStudentId(scope, request);
    if (homeworkMapper.countHomeworkVisibleToStudent(tenantId, homework.getId(), studentId) == 0) {
      throw new BusinessException(ErrorCode.FORBIDDEN, "该学生不在这份作业的可见范围内");
    }
    if (!scope.isStudent() && !scope.isAdmin() && homeworkMapper.countManageableHomework(scope, homework.getId()) == 0) {
      throw new BusinessException(ErrorCode.FORBIDDEN, "只能代录自己负责作业的提交");
    }
    Long submissionId = IdWorker.getId();
    homeworkMapper.insertSubmission(submissionId, tenantId, homework.getId(), studentId, request.content());
    return submissionId;
  }

  @Transactional
  public Long review(Long submissionId, ReviewHomeworkRequest request) {
    Long tenantId = currentUser.tenantId();
    DataScope scope = dataScopeService.current();
    if (homeworkMapper.countReviewableSubmission(scope, submissionId) == 0) {
      throw new BusinessException(ErrorCode.FORBIDDEN, "只能批改自己负责范围内的作业");
    }
    Long reviewId = homeworkMapper.findActiveReviewId(tenantId, submissionId);
    boolean needsCorrection = Boolean.TRUE.equals(request.needsCorrection());
    boolean excellent = Boolean.TRUE.equals(request.excellent());
    if (reviewId == null) {
      reviewId = IdWorker.getId();
      homeworkMapper.insertReview(
          reviewId,
          tenantId,
          submissionId,
          currentUser.userId(),
          request.score(),
          request.comment(),
          request.mistakeTags(),
          needsCorrection,
          excellent
      );
    } else {
      homeworkMapper.updateReview(
          tenantId,
          reviewId,
          currentUser.userId(),
          request.score(),
          request.comment(),
          request.mistakeTags(),
          needsCorrection,
          excellent
      );
    }
    homeworkMapper.markSubmissionReviewed(tenantId, submissionId);
    Long studentUserId = homeworkMapper.findSubmissionStudentUserId(tenantId, submissionId);
    if (studentUserId != null) {
      homeworkMapper.insertNotification(
          IdWorker.getId(),
          tenantId,
          studentUserId,
          "作业已批改",
          needsCorrection ? "老师已批改作业，请查看评语并完成订正。" : "老师已批改作业，请查看评语和错因标签。"
      );
    }
    return reviewId;
  }

  private Homework requireHomework(Long homeworkId, Long tenantId) {
    Homework homework = homeworkMapper.findByIdAndTenantId(tenantId, homeworkId);
    if (homework == null) {
      throw new BusinessException(ErrorCode.NOT_FOUND, "作业不存在");
    }
    return homework;
  }

  private Set<Long> resolveTargetStudentIds(DataScope scope, CreateHomeworkRequest request) {
    Set<Long> studentIds = new LinkedHashSet<>();
    Long classGroupId = request.classGroupId();
    if (classGroupId == null && request.lessonId() != null) {
      classGroupId = homeworkMapper.findAssignableLessonClassGroupId(scope, request.lessonId());
      if (classGroupId == null) {
        throw new BusinessException(ErrorCode.FORBIDDEN, "只能给自己负责的课程布置作业");
      }
    }
    if (classGroupId != null) {
      if (homeworkMapper.countAssignableClass(scope, classGroupId) == 0) {
        throw new BusinessException(ErrorCode.FORBIDDEN, "只能给自己负责的班级布置作业");
      }
      studentIds.addAll(homeworkMapper.listAssignableStudentIdsByClass(scope, classGroupId));
    }
    if (request.studentIds() != null) {
      for (Long studentId : request.studentIds()) {
        if (studentId == null) {
          continue;
        }
        if (homeworkMapper.countAssignableStudent(scope, studentId) == 0) {
          throw new BusinessException(ErrorCode.FORBIDDEN, "只能给自己负责的学生布置作业");
        }
        studentIds.add(studentId);
      }
    }
    if (studentIds.isEmpty()) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "请至少选择一个学生或班级");
    }
    return studentIds;
  }

  private Long resolveSubmitStudentId(DataScope scope, SubmitHomeworkRequest request) {
    if (scope.isStudent()) {
      Long studentId = homeworkMapper.findStudentIdByUser(scope.getTenantId(), scope.getUserId());
      if (studentId == null) {
        throw new BusinessException(ErrorCode.FORBIDDEN, "当前学生账号未绑定学员档案");
      }
      if (request.studentId() != null && !studentId.equals(request.studentId())) {
        throw new BusinessException(ErrorCode.FORBIDDEN, "学生只能提交自己的作业");
      }
      return studentId;
    }
    if (scope.isParent()) {
      throw new BusinessException(ErrorCode.FORBIDDEN, "家长账号暂不支持代提交作业");
    }
    if (request.studentId() == null) {
      throw new BusinessException(ErrorCode.BAD_REQUEST, "请选择提交作业的学生");
    }
    return request.studentId();
  }
}
