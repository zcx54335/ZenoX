package com.zenox.workspace.controller;

import com.zenox.auth.security.RequirePermission;
import com.zenox.common.api.ApiResponse;
import com.zenox.workspace.dto.WorkspaceData;
import com.zenox.workspace.service.WorkspaceService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/workspace")
public class WorkspaceController {
  private final WorkspaceService workspaceService;

  public WorkspaceController(WorkspaceService workspaceService) {
    this.workspaceService = workspaceService;
  }

  @GetMapping
  @RequirePermission(anyOf = {
      "dashboard:view",
      "lesson:view",
      "student:view",
      "homework:view",
      "homework:review",
      "question:view",
      "record:view",
      "reminder:view",
      "billing:view"
  })
  public ApiResponse<WorkspaceData> getWorkspaceData() {
    return ApiResponse.ok(workspaceService.getWorkspaceData());
  }
}
