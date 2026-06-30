package com.zenox.user.controller;

import com.zenox.common.api.ApiResponse;
import com.zenox.user.dto.CreateStudentRequest;
import com.zenox.user.entity.StudentProfile;
import com.zenox.user.service.StudentService;
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
@RequestMapping("/api/students")
public class StudentController {
  private final StudentService studentService;

  public StudentController(StudentService studentService) {
    this.studentService = studentService;
  }

  @GetMapping
  public ApiResponse<List<StudentProfile>> list() {
    return ApiResponse.ok(studentService.list());
  }

  @PostMapping
  public ApiResponse<StudentProfile> create(@Valid @RequestBody CreateStudentRequest request) {
    return ApiResponse.ok(studentService.create(request));
  }

  @DeleteMapping("/{studentId}")
  public ApiResponse<Void> delete(@PathVariable Long studentId) {
    studentService.delete(studentId);
    return ApiResponse.ok();
  }
}
