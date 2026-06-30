package com.zenox.workspace.service;

import com.zenox.common.security.CurrentUser;
import com.zenox.lesson.mapper.LessonMapper;
import com.zenox.workspace.dto.WorkspaceData;
import com.zenox.workspace.mapper.WorkspaceMapper;
import org.springframework.stereotype.Service;

@Service
public class WorkspaceService {
  private final CurrentUser currentUser;
  private final LessonMapper lessonMapper;
  private final WorkspaceMapper workspaceMapper;

  public WorkspaceService(CurrentUser currentUser, LessonMapper lessonMapper, WorkspaceMapper workspaceMapper) {
    this.currentUser = currentUser;
    this.lessonMapper = lessonMapper;
    this.workspaceMapper = workspaceMapper;
  }

  public WorkspaceData getWorkspaceData() {
    Long tenantId = currentUser.tenantId();
    return new WorkspaceData(
        workspaceMapper.listClasses(tenantId),
        workspaceMapper.listStudents(tenantId),
        lessonMapper.listScheduleByTenantId(tenantId),
        workspaceMapper.listHomework(tenantId),
        workspaceMapper.listReviews(tenantId),
        workspaceMapper.listQuestions(tenantId),
        workspaceMapper.listRecords(tenantId),
        workspaceMapper.listReminders(tenantId),
        workspaceMapper.listBilling(tenantId),
        workspaceMapper.listTodos(tenantId)
    );
  }
}
