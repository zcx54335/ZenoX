package com.zenox.classroom.controller;

import com.zenox.auth.security.RequirePermission;
import com.zenox.classroom.dto.AddClassStudentRequest;
import com.zenox.classroom.dto.AddClassTeacherRequest;
import com.zenox.classroom.dto.ClassRosterResponse;
import com.zenox.classroom.dto.CreateClassGroupRequest;
import com.zenox.classroom.entity.ClassGroup;
import com.zenox.classroom.service.ClassGroupService;
import com.zenox.common.api.ApiResponse;
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
@RequestMapping("/api/classes")
public class ClassGroupController {
  private final ClassGroupService classGroupService;

  public ClassGroupController(ClassGroupService classGroupService) {
    this.classGroupService = classGroupService;
  }

  @GetMapping
  @RequirePermission("student:view")
  public ApiResponse<List<ClassGroup>> list() {
    return ApiResponse.ok(classGroupService.list());
  }

  @PostMapping
  @RequirePermission("student:manage")
  public ApiResponse<ClassGroup> create(@Valid @RequestBody CreateClassGroupRequest request) {
    return ApiResponse.ok(classGroupService.create(request));
  }

  @GetMapping("/{classGroupId}/roster")
  @RequirePermission("student:view")
  public ApiResponse<ClassRosterResponse> roster(@PathVariable Long classGroupId) {
    return ApiResponse.ok(classGroupService.roster(classGroupId));
  }

  @PostMapping("/{classGroupId}/students")
  @RequirePermission("student:manage")
  public ApiResponse<ClassRosterResponse> addStudent(
      @PathVariable Long classGroupId,
      @Valid @RequestBody AddClassStudentRequest request
  ) {
    return ApiResponse.ok(classGroupService.addStudent(classGroupId, request));
  }

  @DeleteMapping("/{classGroupId}/students/{studentId}")
  @RequirePermission("student:manage")
  public ApiResponse<ClassRosterResponse> removeStudent(@PathVariable Long classGroupId, @PathVariable Long studentId) {
    return ApiResponse.ok(classGroupService.removeStudent(classGroupId, studentId));
  }

  @PostMapping("/{classGroupId}/teachers")
  @RequirePermission("student:manage")
  public ApiResponse<ClassRosterResponse> addTeacher(
      @PathVariable Long classGroupId,
      @Valid @RequestBody AddClassTeacherRequest request
  ) {
    return ApiResponse.ok(classGroupService.addTeacher(classGroupId, request));
  }

  @DeleteMapping("/{classGroupId}/teachers/{teacherUserId}")
  @RequirePermission("student:manage")
  public ApiResponse<ClassRosterResponse> removeTeacher(
      @PathVariable Long classGroupId,
      @PathVariable Long teacherUserId
  ) {
    return ApiResponse.ok(classGroupService.removeTeacher(classGroupId, teacherUserId));
  }
}
