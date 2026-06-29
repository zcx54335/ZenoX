package com.zenox.classroom.controller;

import com.zenox.classroom.dto.CreateClassGroupRequest;
import com.zenox.classroom.entity.ClassGroup;
import com.zenox.classroom.service.ClassGroupService;
import com.zenox.common.api.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/classes")
public class ClassGroupController {
  private final ClassGroupService classGroupService;

  public ClassGroupController(ClassGroupService classGroupService) {
    this.classGroupService = classGroupService;
  }

  @GetMapping
  public ApiResponse<List<ClassGroup>> list() {
    return ApiResponse.ok(classGroupService.list());
  }

  @PostMapping
  public ApiResponse<ClassGroup> create(@Valid @RequestBody CreateClassGroupRequest request) {
    return ApiResponse.ok(classGroupService.create(request));
  }
}
