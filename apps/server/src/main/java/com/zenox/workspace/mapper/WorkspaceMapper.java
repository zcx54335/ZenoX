package com.zenox.workspace.mapper;

import com.zenox.common.security.DataScope;
import com.zenox.workspace.dto.BillingSummary;
import com.zenox.workspace.dto.ClassGroupSummary;
import com.zenox.workspace.dto.ClassRecordSummary;
import com.zenox.workspace.dto.HomeworkSummary;
import com.zenox.workspace.dto.QuestionSummary;
import com.zenox.workspace.dto.ReminderSummary;
import com.zenox.workspace.dto.ReviewSummary;
import com.zenox.workspace.dto.StudentSummary;
import com.zenox.workspace.dto.TodoSummary;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface WorkspaceMapper {
  @Select("""
      SELECT
        cg.id,
        cg.name,
        cg.subject,
        cg.grade,
        cg.description,
        COUNT(DISTINCT cm.student_id) AS studentCount,
        GROUP_CONCAT(DISTINCT ua.display_name ORDER BY ua.display_name SEPARATOR '、') AS teacherNames
      FROM class_group cg
      LEFT JOIN class_member cm
        ON cm.class_group_id = cg.id
       AND cm.deleted_at IS NULL
      LEFT JOIN class_teacher ct
        ON ct.class_group_id = cg.id
       AND ct.deleted_at IS NULL
      LEFT JOIN user_account ua
        ON ua.id = ct.teacher_user_id
       AND ua.deleted_at IS NULL
      WHERE cg.tenant_id = #{scope.tenantId}
        AND cg.deleted_at IS NULL
        AND (
          #{scope.admin} = TRUE
          OR (#{scope.teacher} = TRUE AND EXISTS (
            SELECT 1 FROM class_teacher scoped_ct
            WHERE scoped_ct.class_group_id = cg.id
              AND scoped_ct.teacher_user_id = #{scope.userId}
              AND scoped_ct.deleted_at IS NULL
          ))
          OR (#{scope.student} = TRUE AND EXISTS (
            SELECT 1 FROM class_member scoped_cm
            JOIN student_profile scoped_sp
              ON scoped_sp.id = scoped_cm.student_id
             AND scoped_sp.user_id = #{scope.userId}
             AND scoped_sp.deleted_at IS NULL
            WHERE scoped_cm.class_group_id = cg.id
              AND scoped_cm.deleted_at IS NULL
          ))
          OR (#{scope.parent} = TRUE AND EXISTS (
            SELECT 1 FROM class_member scoped_cm
            JOIN parent_student scoped_ps
              ON scoped_ps.student_id = scoped_cm.student_id
             AND scoped_ps.deleted_at IS NULL
            JOIN parent_profile scoped_pp
              ON scoped_pp.id = scoped_ps.parent_id
             AND scoped_pp.user_id = #{scope.userId}
             AND scoped_pp.deleted_at IS NULL
            WHERE scoped_cm.class_group_id = cg.id
              AND scoped_cm.deleted_at IS NULL
          ))
        )
      GROUP BY cg.id, cg.name, cg.subject, cg.grade, cg.description
      ORDER BY cg.created_at DESC
      """)
  List<ClassGroupSummary> listClasses(@Param("scope") DataScope scope);

  @Select("""
      SELECT
        sp.id,
        sp.name,
        sp.grade,
        sp.school,
        sp.subject,
        sp.parent_name AS parentName,
        sp.parent_phone AS parentPhone,
        sp.remaining_lessons AS remainingLessons,
        sp.weakness_note AS weaknessNote,
        GROUP_CONCAT(DISTINCT cg.name ORDER BY cg.name SEPARATOR '、') AS classNames
      FROM student_profile sp
      LEFT JOIN class_member cm
        ON cm.student_id = sp.id
       AND cm.deleted_at IS NULL
      LEFT JOIN class_group cg
        ON cg.id = cm.class_group_id
       AND cg.deleted_at IS NULL
      WHERE sp.tenant_id = #{scope.tenantId}
        AND sp.deleted_at IS NULL
        AND (
          #{scope.admin} = TRUE
          OR (#{scope.teacher} = TRUE AND EXISTS (
            SELECT 1 FROM class_member scoped_cm
            JOIN class_teacher scoped_ct
              ON scoped_ct.class_group_id = scoped_cm.class_group_id
             AND scoped_ct.teacher_user_id = #{scope.userId}
             AND scoped_ct.deleted_at IS NULL
            WHERE scoped_cm.student_id = sp.id
              AND scoped_cm.deleted_at IS NULL
          ))
          OR (#{scope.student} = TRUE AND sp.user_id = #{scope.userId})
          OR (#{scope.parent} = TRUE AND EXISTS (
            SELECT 1 FROM parent_student scoped_ps
            JOIN parent_profile scoped_pp
              ON scoped_pp.id = scoped_ps.parent_id
             AND scoped_pp.user_id = #{scope.userId}
             AND scoped_pp.deleted_at IS NULL
            WHERE scoped_ps.student_id = sp.id
              AND scoped_ps.deleted_at IS NULL
          ))
        )
      GROUP BY
        sp.id,
        sp.name,
        sp.grade,
        sp.school,
        sp.subject,
        sp.parent_name,
        sp.parent_phone,
        sp.remaining_lessons,
        sp.weakness_note
      ORDER BY sp.created_at DESC
      """)
  List<StudentSummary> listStudents(@Param("scope") DataScope scope);

  @Select("""
      SELECT
        h.id,
        h.lesson_id AS lessonId,
        hv.target_id AS studentId,
        sp.name AS studentName,
        cg.name AS classGroupName,
        h.title,
        h.content,
        h.due_at AS dueAt,
        h.status,
        COUNT(DISTINCT hs.id) AS submissionCount,
        COUNT(DISTINCT hr.id) AS reviewCount,
        COUNT(DISTINCT fa.id) AS attachmentCount
      FROM homework h
      JOIN homework_visibility hv
        ON hv.homework_id = h.id
       AND hv.target_type = 'STUDENT'
       AND hv.deleted_at IS NULL
      JOIN student_profile sp
        ON sp.id = hv.target_id
       AND sp.deleted_at IS NULL
      LEFT JOIN lesson l
        ON l.id = h.lesson_id
       AND l.deleted_at IS NULL
      LEFT JOIN class_group cg
        ON cg.id = l.class_group_id
       AND cg.deleted_at IS NULL
      LEFT JOIN homework_submission hs
        ON hs.homework_id = h.id
       AND hs.student_id = sp.id
       AND hs.deleted_at IS NULL
      LEFT JOIN homework_review hr
        ON hr.submission_id = hs.id
       AND hr.deleted_at IS NULL
      LEFT JOIN file_attachment fa
        ON fa.owner_type = 'HOMEWORK'
       AND fa.owner_id = h.id
       AND fa.deleted_at IS NULL
      WHERE h.tenant_id = #{scope.tenantId}
        AND h.deleted_at IS NULL
        AND (
          #{scope.admin} = TRUE
          OR (#{scope.teacher} = TRUE AND (
            h.teacher_user_id = #{scope.userId}
            OR EXISTS (
              SELECT 1
              FROM lesson scoped_l
              JOIN class_teacher scoped_ct
                ON scoped_ct.class_group_id = scoped_l.class_group_id
               AND scoped_ct.teacher_user_id = #{scope.userId}
               AND scoped_ct.deleted_at IS NULL
              WHERE scoped_l.id = h.lesson_id
                AND scoped_l.deleted_at IS NULL
            )
          ))
          OR (#{scope.student} = TRUE AND EXISTS (
            SELECT 1
            FROM homework_visibility scoped_hv
            JOIN student_profile scoped_sp
              ON scoped_sp.id = scoped_hv.target_id
             AND scoped_sp.user_id = #{scope.userId}
             AND scoped_sp.deleted_at IS NULL
            WHERE scoped_hv.homework_id = h.id
              AND scoped_hv.target_type = 'STUDENT'
              AND scoped_hv.deleted_at IS NULL
          ))
          OR (#{scope.parent} = TRUE AND EXISTS (
            SELECT 1
            FROM homework_visibility scoped_hv
            JOIN parent_student scoped_ps
              ON scoped_ps.student_id = scoped_hv.target_id
             AND scoped_ps.deleted_at IS NULL
            JOIN parent_profile scoped_pp
              ON scoped_pp.id = scoped_ps.parent_id
             AND scoped_pp.user_id = #{scope.userId}
             AND scoped_pp.deleted_at IS NULL
            WHERE scoped_hv.homework_id = h.id
              AND scoped_hv.target_type = 'STUDENT'
              AND scoped_hv.deleted_at IS NULL
          ))
        )
      GROUP BY
        h.id,
        h.lesson_id,
        hv.target_id,
        sp.name,
        cg.name,
        h.title,
        h.content,
        h.due_at,
        h.status
      ORDER BY h.due_at ASC, h.created_at DESC
      """)
  List<HomeworkSummary> listHomework(@Param("scope") DataScope scope);

  @Select("""
      SELECT
        hs.id AS submissionId,
        h.id AS homeworkId,
        sp.id AS studentId,
        sp.name AS studentName,
        h.title AS homeworkTitle,
        hs.status,
        hr.mistake_tags AS mistakeTags,
        hr.needs_correction AS needsCorrection,
        hr.excellent AS excellent,
        hr.comment,
        hr.score,
        hs.submitted_at AS submittedAt,
        hr.reviewed_at AS reviewedAt
      FROM homework_submission hs
      JOIN homework h
        ON h.id = hs.homework_id
       AND h.deleted_at IS NULL
      JOIN student_profile sp
        ON sp.id = hs.student_id
       AND sp.deleted_at IS NULL
      LEFT JOIN homework_review hr
        ON hr.submission_id = hs.id
       AND hr.deleted_at IS NULL
      WHERE hs.tenant_id = #{scope.tenantId}
        AND hs.deleted_at IS NULL
        AND (
          #{scope.admin} = TRUE
          OR (#{scope.teacher} = TRUE AND (
            h.teacher_user_id = #{scope.userId}
            OR hr.reviewer_user_id = #{scope.userId}
            OR EXISTS (
              SELECT 1
              FROM lesson scoped_l
              JOIN class_teacher scoped_ct
                ON scoped_ct.class_group_id = scoped_l.class_group_id
               AND scoped_ct.teacher_user_id = #{scope.userId}
               AND scoped_ct.deleted_at IS NULL
              WHERE scoped_l.id = h.lesson_id
                AND scoped_l.deleted_at IS NULL
            )
          ))
          OR (#{scope.student} = TRUE AND sp.user_id = #{scope.userId})
          OR (#{scope.parent} = TRUE AND EXISTS (
            SELECT 1
            FROM parent_student scoped_ps
            JOIN parent_profile scoped_pp
              ON scoped_pp.id = scoped_ps.parent_id
             AND scoped_pp.user_id = #{scope.userId}
             AND scoped_pp.deleted_at IS NULL
            WHERE scoped_ps.student_id = sp.id
              AND scoped_ps.deleted_at IS NULL
          ))
        )
      ORDER BY COALESCE(hs.submitted_at, hs.created_at) DESC
      """)
  List<ReviewSummary> listReviews(@Param("scope") DataScope scope);

  @Select("""
      SELECT
        q.id,
        q.title,
        q.subject,
        q.grade,
        q.knowledge_point AS knowledgePoint,
        q.difficulty,
        q.content,
        q.scope,
        ua.display_name AS creatorName,
        COUNT(DISTINCT CASE WHEN qi.interaction_type = 'LIKE' THEN qi.id END) AS likeCount,
        COUNT(DISTINCT CASE WHEN qi.interaction_type = 'FAVORITE' THEN qi.id END) AS favoriteCount,
        COUNT(DISTINCT CASE WHEN qi.interaction_type = 'COMMENT' THEN qi.id END) AS commentCount,
        COUNT(DISTINCT fa.id) AS attachmentCount,
        COUNT(DISTINCT CASE WHEN qi.interaction_type = 'LIKE' AND qi.user_id = #{scope.userId} THEN qi.id END) > 0 AS likedByMe,
        COUNT(DISTINCT CASE WHEN qi.interaction_type = 'FAVORITE' AND qi.user_id = #{scope.userId} THEN qi.id END) > 0 AS favoriteByMe
      FROM question q
      JOIN user_account ua
        ON ua.id = q.creator_user_id
       AND ua.deleted_at IS NULL
      LEFT JOIN question_interaction qi
        ON qi.question_id = q.id
       AND qi.deleted_at IS NULL
      LEFT JOIN file_attachment fa
        ON fa.owner_type = 'QUESTION'
       AND fa.owner_id = q.id
       AND fa.deleted_at IS NULL
      WHERE q.tenant_id = #{scope.tenantId}
        AND q.deleted_at IS NULL
        AND (
          #{scope.admin} = TRUE
          OR q.creator_user_id = #{scope.userId}
          OR q.scope = 'PUBLIC'
        )
      GROUP BY
        q.id,
        q.title,
        q.subject,
        q.grade,
        q.knowledge_point,
        q.difficulty,
        q.content,
        q.scope,
        ua.display_name
      ORDER BY q.created_at DESC
      """)
  List<QuestionSummary> listQuestions(@Param("scope") DataScope scope);

  @Select("""
      SELECT
        la.id AS attendanceId,
        l.id AS lessonId,
        sp.id AS studentId,
        sp.name AS studentName,
        cg.name AS classGroupName,
        l.topic,
        la.status,
        la.teacher_comment AS teacherComment,
        l.starts_at AS startsAt
      FROM lesson_attendance la
      JOIN lesson l
        ON l.id = la.lesson_id
       AND l.deleted_at IS NULL
      JOIN student_profile sp
        ON sp.id = la.student_id
       AND sp.deleted_at IS NULL
      LEFT JOIN class_group cg
        ON cg.id = l.class_group_id
       AND cg.deleted_at IS NULL
      WHERE la.tenant_id = #{scope.tenantId}
        AND la.deleted_at IS NULL
        AND (
          #{scope.admin} = TRUE
          OR (#{scope.teacher} = TRUE AND (
            l.teacher_user_id = #{scope.userId}
            OR EXISTS (
              SELECT 1
              FROM class_teacher scoped_ct
              WHERE scoped_ct.class_group_id = l.class_group_id
                AND scoped_ct.teacher_user_id = #{scope.userId}
                AND scoped_ct.deleted_at IS NULL
            )
          ))
          OR (#{scope.student} = TRUE AND sp.user_id = #{scope.userId})
          OR (#{scope.parent} = TRUE AND EXISTS (
            SELECT 1
            FROM parent_student scoped_ps
            JOIN parent_profile scoped_pp
              ON scoped_pp.id = scoped_ps.parent_id
             AND scoped_pp.user_id = #{scope.userId}
             AND scoped_pp.deleted_at IS NULL
            WHERE scoped_ps.student_id = sp.id
              AND scoped_ps.deleted_at IS NULL
          ))
        )
      ORDER BY l.starts_at DESC, sp.name ASC
      """)
  List<ClassRecordSummary> listRecords(@Param("scope") DataScope scope);

  @Select("""
      SELECT
        nt.id,
        CASE
          WHEN nt.title LIKE '%作业%' THEN 'homework'
          WHEN nt.title LIKE '%账单%' OR nt.title LIKE '%收款%' THEN 'billing'
          WHEN nt.title LIKE '%上课%' THEN 'lesson'
          ELSE 'system'
        END AS category,
        nt.title,
        nt.content,
        nt.scheduled_at AS scheduledAt,
        nt.status,
        nt.channel
      FROM notification_task nt
      WHERE nt.tenant_id = #{scope.tenantId}
        AND nt.deleted_at IS NULL
        AND (
          #{scope.admin} = TRUE
          OR nt.target_user_id = #{scope.userId}
        )
      ORDER BY nt.scheduled_at ASC
      """)
  List<ReminderSummary> listReminders(@Param("scope") DataScope scope);

  @Select("""
      SELECT
        bc.id AS cycleId,
        sp.id AS studentId,
        sp.name AS studentName,
        bc.cycle_month AS cycleMonth,
        bc.total_amount AS totalAmount,
        COALESCE(payments.paid_amount, 0) AS paidAmount,
        bc.total_amount - COALESCE(payments.paid_amount, 0) AS unpaidAmount,
        bc.status,
        COALESCE(items.item_count, 0) AS itemCount
      FROM billing_cycle bc
      JOIN student_profile sp
        ON sp.id = bc.student_id
       AND sp.deleted_at IS NULL
      LEFT JOIN (
        SELECT billing_cycle_id, COUNT(*) AS item_count
        FROM billing_item
        WHERE deleted_at IS NULL
        GROUP BY billing_cycle_id
      ) items
        ON items.billing_cycle_id = bc.id
      LEFT JOIN (
        SELECT billing_cycle_id, SUM(amount) AS paid_amount
        FROM payment_record
        WHERE deleted_at IS NULL
        GROUP BY billing_cycle_id
      ) payments
        ON payments.billing_cycle_id = bc.id
      WHERE bc.tenant_id = #{scope.tenantId}
        AND bc.deleted_at IS NULL
        AND (
          #{scope.admin} = TRUE
          OR (#{scope.teacher} = TRUE AND EXISTS (
            SELECT 1
            FROM class_member scoped_cm
            JOIN class_teacher scoped_ct
              ON scoped_ct.class_group_id = scoped_cm.class_group_id
             AND scoped_ct.teacher_user_id = #{scope.userId}
             AND scoped_ct.deleted_at IS NULL
            WHERE scoped_cm.student_id = sp.id
              AND scoped_cm.deleted_at IS NULL
          ))
          OR (#{scope.student} = TRUE AND sp.user_id = #{scope.userId})
          OR (#{scope.parent} = TRUE AND EXISTS (
            SELECT 1
            FROM parent_student scoped_ps
            JOIN parent_profile scoped_pp
              ON scoped_pp.id = scoped_ps.parent_id
             AND scoped_pp.user_id = #{scope.userId}
             AND scoped_pp.deleted_at IS NULL
            WHERE scoped_ps.student_id = sp.id
              AND scoped_ps.deleted_at IS NULL
          ))
        )
      ORDER BY bc.cycle_month DESC, sp.name ASC
      """)
  List<BillingSummary> listBilling(@Param("scope") DataScope scope);

  @Select("""
      SELECT category, label, detail, priority, dueAt, targetType, targetId, action, status
      FROM (
        SELECT
          'lesson' AS category,
          CONCAT(DATE_FORMAT(l.starts_at, '%H:%i'), ' ', cg.name, ' 上课') AS label,
          CONCAT(COALESCE(l.subject, '课程'), ' · ', COALESCE(l.topic, '未填写主题')) AS detail,
          'high' AS priority,
          l.starts_at AS dueAt,
          'LESSON' AS targetType,
          l.id AS targetId,
          'COMPLETE_LESSON' AS action,
          l.status AS status
        FROM lesson l
        JOIN class_group cg
          ON cg.id = l.class_group_id
         AND cg.deleted_at IS NULL
        WHERE l.tenant_id = #{scope.tenantId}
          AND l.deleted_at IS NULL
          AND l.status = 'SCHEDULED'
          AND (
            #{scope.admin} = TRUE
            OR (#{scope.teacher} = TRUE AND (
              l.teacher_user_id = #{scope.userId}
              OR EXISTS (
                SELECT 1
                FROM class_teacher scoped_ct
                WHERE scoped_ct.class_group_id = l.class_group_id
                  AND scoped_ct.teacher_user_id = #{scope.userId}
                  AND scoped_ct.deleted_at IS NULL
              )
            ))
          )
        UNION ALL
        SELECT
          'homework' AS category,
          CONCAT(sp.name, ' 作业待批改') AS label,
          CONCAT(h.title, ' · 已提交 ', DATE_FORMAT(hs.submitted_at, '%m/%d %H:%i')) AS detail,
          'medium' AS priority,
          COALESCE(hs.submitted_at, hs.created_at) AS dueAt,
          'HOMEWORK_SUBMISSION' AS targetType,
          hs.id AS targetId,
          'REVIEW_HOMEWORK' AS action,
          hs.status AS status
        FROM homework_submission hs
        JOIN homework h
          ON h.id = hs.homework_id
         AND h.deleted_at IS NULL
        JOIN student_profile sp
          ON sp.id = hs.student_id
         AND sp.deleted_at IS NULL
        LEFT JOIN homework_review hr
          ON hr.submission_id = hs.id
         AND hr.deleted_at IS NULL
        WHERE hs.tenant_id = #{scope.tenantId}
          AND hs.deleted_at IS NULL
          AND hr.id IS NULL
          AND (
            #{scope.admin} = TRUE
            OR (#{scope.teacher} = TRUE AND (
              h.teacher_user_id = #{scope.userId}
              OR EXISTS (
                SELECT 1
                FROM lesson scoped_l
                JOIN class_teacher scoped_ct
                  ON scoped_ct.class_group_id = scoped_l.class_group_id
                 AND scoped_ct.teacher_user_id = #{scope.userId}
                 AND scoped_ct.deleted_at IS NULL
                WHERE scoped_l.id = h.lesson_id
                  AND scoped_l.deleted_at IS NULL
              )
            ))
          )
        UNION ALL
        SELECT
          'billing' AS category,
          CONCAT(sp.name, ' 账单待收款') AS label,
          CONCAT('剩余 ¥', FORMAT(bc.total_amount - COALESCE(SUM(pr.amount), 0), 2)) AS detail,
          'high' AS priority,
          CAST(CONCAT(LAST_DAY(bc.cycle_month), ' 20:00:00') AS DATETIME) AS dueAt,
          'BILLING_CYCLE' AS targetType,
          bc.id AS targetId,
          'RECORD_PAYMENT' AS action,
          bc.status AS status
        FROM billing_cycle bc
        JOIN student_profile sp
          ON sp.id = bc.student_id
         AND sp.deleted_at IS NULL
        LEFT JOIN payment_record pr
          ON pr.billing_cycle_id = bc.id
         AND pr.deleted_at IS NULL
        WHERE bc.tenant_id = #{scope.tenantId}
          AND bc.deleted_at IS NULL
          AND (
            #{scope.admin} = TRUE
            OR (#{scope.teacher} = TRUE AND EXISTS (
              SELECT 1
              FROM class_member scoped_cm
              JOIN class_teacher scoped_ct
                ON scoped_ct.class_group_id = scoped_cm.class_group_id
               AND scoped_ct.teacher_user_id = #{scope.userId}
               AND scoped_ct.deleted_at IS NULL
              WHERE scoped_cm.student_id = sp.id
                AND scoped_cm.deleted_at IS NULL
            ))
          )
        GROUP BY bc.id, sp.name, bc.total_amount, bc.cycle_month
        HAVING bc.total_amount - COALESCE(SUM(pr.amount), 0) > 0
        UNION ALL
        SELECT
          CASE
            WHEN nt.title LIKE '%作业%' THEN 'homework'
            WHEN nt.title LIKE '%账单%' OR nt.title LIKE '%收款%' THEN 'billing'
            WHEN nt.title LIKE '%上课%' THEN 'lesson'
            ELSE 'system'
          END AS category,
          nt.title AS label,
          COALESCE(nt.content, '系统内提醒') AS detail,
          'low' AS priority,
          nt.scheduled_at AS dueAt,
          'NOTIFICATION' AS targetType,
          nt.id AS targetId,
          'OPEN_REMINDER' AS action,
          nt.status AS status
        FROM notification_task nt
        WHERE nt.tenant_id = #{scope.tenantId}
          AND nt.deleted_at IS NULL
          AND nt.status = 'PENDING'
          AND (
            #{scope.admin} = TRUE
            OR nt.target_user_id = #{scope.userId}
          )
      ) todo_source
      ORDER BY dueAt ASC
      LIMIT 12
      """)
  List<TodoSummary> listTodos(@Param("scope") DataScope scope);
}
