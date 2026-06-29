package com.zenox.homework.service;

import com.zenox.common.enums.HomeworkStatus;
import com.zenox.common.security.CurrentUser;
import com.zenox.homework.dto.CreateHomeworkRequest;
import com.zenox.homework.entity.Homework;
import com.zenox.homework.mapper.HomeworkMapper;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class HomeworkService {
  private final CurrentUser currentUser;
  private final HomeworkMapper homeworkMapper;

  public HomeworkService(CurrentUser currentUser, HomeworkMapper homeworkMapper) {
    this.currentUser = currentUser;
    this.homeworkMapper = homeworkMapper;
  }

  public List<Homework> list() {
    return homeworkMapper.listByTenantId(currentUser.tenantId());
  }

  @Transactional
  public Homework create(CreateHomeworkRequest request) {
    Homework homework = new Homework();
    homework.setTenantId(currentUser.tenantId());
    homework.setTeacherUserId(currentUser.userId());
    homework.setLessonId(request.lessonId());
    homework.setTitle(request.title());
    homework.setContent(request.content());
    homework.setDueAt(request.dueAt());
    homework.setStatus(Boolean.TRUE.equals(request.publishNow()) ? HomeworkStatus.PUBLISHED : HomeworkStatus.DRAFT);
    homeworkMapper.insert(homework);
    return homework;
  }
}
