package com.zenox.workspace.service;

import com.zenox.auth.security.PermissionService;
import com.zenox.common.security.DataScope;
import com.zenox.common.security.DataScopeService;
import com.zenox.lesson.mapper.LessonMapper;
import com.zenox.workspace.dto.WorkspaceData;
import com.zenox.workspace.mapper.WorkspaceMapper;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class WorkspaceService {
  private final DataScopeService dataScopeService;
  private final LessonMapper lessonMapper;
  private final PermissionService permissionService;
  private final WorkspaceMapper workspaceMapper;

  public WorkspaceService(
      DataScopeService dataScopeService,
      LessonMapper lessonMapper,
      PermissionService permissionService,
      WorkspaceMapper workspaceMapper
  ) {
    this.dataScopeService = dataScopeService;
    this.lessonMapper = lessonMapper;
    this.permissionService = permissionService;
    this.workspaceMapper = workspaceMapper;
  }

  public WorkspaceData getWorkspaceData() {
    DataScope scope = dataScopeService.current();
    return new WorkspaceData(
        permissionService.hasPermission("student:view") ? workspaceMapper.listClasses(scope) : List.of(),
        permissionService.hasPermission("student:view") ? workspaceMapper.listStudents(scope) : List.of(),
        permissionService.hasPermission("lesson:view") ? lessonMapper.listScheduleByScope(scope) : List.of(),
        permissionService.hasPermission("homework:view") ? workspaceMapper.listHomework(scope) : List.of(),
        permissionService.hasPermission("homework:review") ? workspaceMapper.listReviews(scope) : List.of(),
        permissionService.hasPermission("question:view") ? workspaceMapper.listQuestions(scope) : List.of(),
        permissionService.hasPermission("record:view") ? workspaceMapper.listRecords(scope) : List.of(),
        permissionService.hasPermission("reminder:view") ? workspaceMapper.listReminders(scope) : List.of(),
        permissionService.hasPermission("billing:view") ? workspaceMapper.listBilling(scope) : List.of(),
        permissionService.hasPermission("dashboard:view") ? workspaceMapper.listTodos(scope) : List.of()
    );
  }
}
