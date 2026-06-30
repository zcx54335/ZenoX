package com.zenox.classroom.dto;

import com.zenox.classroom.entity.ClassGroup;
import java.util.List;

public record ClassRosterResponse(
    ClassGroup classGroup,
    List<ClassMemberSummary> students,
    List<ClassTeacherSummary> teachers,
    List<ClassMemberSummary> availableStudents,
    List<ClassTeacherSummary> availableTeachers
) {
}
