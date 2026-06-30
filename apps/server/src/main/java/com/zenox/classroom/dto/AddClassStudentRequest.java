package com.zenox.classroom.dto;

import jakarta.validation.constraints.NotNull;

public record AddClassStudentRequest(
    @NotNull Long studentId,
    Boolean confirmCrossClass
) {
}
