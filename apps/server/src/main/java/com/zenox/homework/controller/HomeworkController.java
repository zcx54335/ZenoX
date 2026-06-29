package com.zenox.homework.controller;

import com.zenox.common.api.ApiResponse;
import com.zenox.homework.dto.CreateHomeworkRequest;
import com.zenox.homework.entity.Homework;
import com.zenox.homework.service.HomeworkService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/homework")
public class HomeworkController {
  private final HomeworkService homeworkService;

  public HomeworkController(HomeworkService homeworkService) {
    this.homeworkService = homeworkService;
  }

  @GetMapping
  public ApiResponse<List<Homework>> list() {
    return ApiResponse.ok(homeworkService.list());
  }

  @PostMapping
  public ApiResponse<Homework> create(@Valid @RequestBody CreateHomeworkRequest request) {
    return ApiResponse.ok(homeworkService.create(request));
  }
}
