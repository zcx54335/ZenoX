package com.zenox.workspace.dto;

import com.zenox.lesson.dto.LessonScheduleItem;
import java.util.List;

public record WorkspaceData(
    List<ClassGroupSummary> classes,
    List<StudentSummary> students,
    List<LessonScheduleItem> lessons,
    List<HomeworkSummary> homework,
    List<ReviewSummary> reviews,
    List<QuestionSummary> questions,
    List<ClassRecordSummary> records,
    List<ReminderSummary> reminders,
    List<BillingSummary> billing,
    List<TodoSummary> todos
) {
}
