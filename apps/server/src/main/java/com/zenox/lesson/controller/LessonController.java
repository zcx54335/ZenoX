package com.zenox.lesson.controller;

import com.zenox.common.api.ApiResponse;
import com.zenox.lesson.dto.CreateLessonRequest;
import com.zenox.lesson.dto.LessonScheduleItem;
import com.zenox.lesson.dto.RescheduleLessonRequest;
import com.zenox.lesson.entity.Lesson;
import com.zenox.lesson.service.LessonService;
import jakarta.validation.Valid;
import java.time.YearMonth;
import java.util.List;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/lessons")
public class LessonController {
  private final LessonService lessonService;

  public LessonController(LessonService lessonService) {
    this.lessonService = lessonService;
  }

  @GetMapping
  public ApiResponse<List<LessonScheduleItem>> list() {
    return ApiResponse.ok(lessonService.list());
  }

  @GetMapping("/export")
  public ResponseEntity<byte[]> export(@RequestParam String month) {
    YearMonth selectedMonth = YearMonth.parse(month);
    byte[] content = lessonService.exportMonthlyLessons(selectedMonth);
    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
        .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
            .filename("zenox-lessons-" + selectedMonth + ".xlsx")
            .build()
            .toString())
        .body(content);
  }

  @PostMapping
  public ApiResponse<Lesson> create(@Valid @RequestBody CreateLessonRequest request) {
    return ApiResponse.ok(lessonService.create(request));
  }

  @PutMapping("/{id}/reschedule")
  public ApiResponse<Lesson> reschedule(
      @PathVariable Long id,
      @Valid @RequestBody RescheduleLessonRequest request
  ) {
    return ApiResponse.ok(lessonService.reschedule(id, request));
  }

  @PatchMapping("/{id}/cancel")
  public ApiResponse<Lesson> cancel(@PathVariable Long id) {
    return ApiResponse.ok(lessonService.cancel(id));
  }
}
