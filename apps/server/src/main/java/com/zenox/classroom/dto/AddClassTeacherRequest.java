package com.zenox.classroom.dto;

import jakarta.validation.constraints.NotNull;

public record AddClassTeacherRequest(
    @NotNull Long teacherUserId
) {
}
