package com.zenox.user.controller;

import com.zenox.common.api.ApiResponse;
import com.zenox.user.dto.CreateTeacherRequest;
import com.zenox.user.dto.TeacherProfileSummary;
import com.zenox.user.service.TeacherService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/teachers")
public class TeacherController {
  private final TeacherService teacherService;

  public TeacherController(TeacherService teacherService) {
    this.teacherService = teacherService;
  }

  @GetMapping
  public ApiResponse<List<TeacherProfileSummary>> list() {
    return ApiResponse.ok(teacherService.list());
  }

  @PostMapping
  public ApiResponse<TeacherProfileSummary> create(@Valid @RequestBody CreateTeacherRequest request) {
    return ApiResponse.ok(teacherService.create(request));
  }

  @DeleteMapping("/{teacherUserId}")
  public ApiResponse<Void> delete(@PathVariable Long teacherUserId) {
    teacherService.delete(teacherUserId);
    return ApiResponse.ok();
  }
}
