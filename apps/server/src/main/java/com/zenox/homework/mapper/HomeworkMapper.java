package com.zenox.homework.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zenox.common.security.DataScope;
import com.zenox.homework.entity.Homework;
import java.util.List;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface HomeworkMapper extends BaseMapper<Homework> {
  @Select("""
      SELECT
        h.id,
        h.tenant_id AS tenantId,
        h.lesson_id AS lessonId,
        h.teacher_user_id AS teacherUserId,
        h.title,
        h.content,
        h.due_at AS dueAt,
        h.status,
        h.created_at AS createdAt,
        h.updated_at AS updatedAt,
        h.deleted_at AS deletedAt
      FROM homework h
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
      ORDER BY h.created_at DESC
      """)
  List<Homework> listByScope(@Param("scope") DataScope scope);

  @Select("""
      SELECT
        h.id,
        h.tenant_id AS tenantId,
        h.lesson_id AS lessonId,
        h.teacher_user_id AS teacherUserId,
        h.title,
        h.content,
        h.due_at AS dueAt,
        h.status,
        h.created_at AS createdAt,
        h.updated_at AS updatedAt,
        h.deleted_at AS deletedAt
      FROM homework h
      WHERE h.id = #{homeworkId}
        AND h.tenant_id = #{tenantId}
        AND h.deleted_at IS NULL
      LIMIT 1
      """)
  Homework findByIdAndTenantId(@Param("tenantId") Long tenantId, @Param("homeworkId") Long homeworkId);

  @Select("""
      SELECT COUNT(*)
      FROM class_group cg
      WHERE cg.id = #{classGroupId}
        AND cg.tenant_id = #{scope.tenantId}
        AND cg.deleted_at IS NULL
        AND (
          #{scope.admin} = TRUE
          OR (#{scope.teacher} = TRUE AND EXISTS (
            SELECT 1
            FROM class_teacher ct
            WHERE ct.class_group_id = cg.id
              AND ct.teacher_user_id = #{scope.userId}
              AND ct.deleted_at IS NULL
          ))
        )
      """)
  int countAssignableClass(@Param("scope") DataScope scope, @Param("classGroupId") Long classGroupId);

  @Select("""
      SELECT COUNT(*)
      FROM student_profile sp
      WHERE sp.id = #{studentId}
        AND sp.tenant_id = #{scope.tenantId}
        AND sp.deleted_at IS NULL
        AND (
          #{scope.admin} = TRUE
          OR (#{scope.teacher} = TRUE AND EXISTS (
            SELECT 1
            FROM class_member cm
            JOIN class_teacher ct
              ON ct.class_group_id = cm.class_group_id
             AND ct.teacher_user_id = #{scope.userId}
             AND ct.deleted_at IS NULL
            WHERE cm.student_id = sp.id
              AND cm.deleted_at IS NULL
          ))
        )
      """)
  int countAssignableStudent(@Param("scope") DataScope scope, @Param("studentId") Long studentId);

  @Select("""
      SELECT cm.student_id
      FROM class_member cm
      JOIN student_profile sp
        ON sp.id = cm.student_id
       AND sp.deleted_at IS NULL
      WHERE cm.tenant_id = #{scope.tenantId}
        AND cm.class_group_id = #{classGroupId}
        AND cm.deleted_at IS NULL
        AND (
          #{scope.admin} = TRUE
          OR (#{scope.teacher} = TRUE AND EXISTS (
            SELECT 1
            FROM class_teacher ct
            WHERE ct.class_group_id = cm.class_group_id
              AND ct.teacher_user_id = #{scope.userId}
              AND ct.deleted_at IS NULL
          ))
        )
      ORDER BY sp.name ASC
      """)
  List<Long> listAssignableStudentIdsByClass(@Param("scope") DataScope scope, @Param("classGroupId") Long classGroupId);

  @Select("""
      SELECT l.class_group_id
      FROM lesson l
      WHERE l.id = #{lessonId}
        AND l.tenant_id = #{scope.tenantId}
        AND l.deleted_at IS NULL
        AND (
          #{scope.admin} = TRUE
          OR (#{scope.teacher} = TRUE AND (
            l.teacher_user_id = #{scope.userId}
            OR EXISTS (
              SELECT 1
              FROM class_teacher ct
              WHERE ct.class_group_id = l.class_group_id
                AND ct.teacher_user_id = #{scope.userId}
                AND ct.deleted_at IS NULL
            )
          ))
        )
      LIMIT 1
      """)
  Long findAssignableLessonClassGroupId(@Param("scope") DataScope scope, @Param("lessonId") Long lessonId);

  @Select("""
      SELECT COUNT(*)
      FROM homework h
      WHERE h.id = #{homeworkId}
        AND h.tenant_id = #{scope.tenantId}
        AND h.deleted_at IS NULL
        AND (
          #{scope.admin} = TRUE
          OR (#{scope.teacher} = TRUE AND (
            h.teacher_user_id = #{scope.userId}
            OR EXISTS (
              SELECT 1
              FROM lesson l
              JOIN class_teacher ct
                ON ct.class_group_id = l.class_group_id
               AND ct.teacher_user_id = #{scope.userId}
               AND ct.deleted_at IS NULL
              WHERE l.id = h.lesson_id
                AND l.deleted_at IS NULL
            )
          ))
        )
      """)
  int countManageableHomework(@Param("scope") DataScope scope, @Param("homeworkId") Long homeworkId);

  @Select("""
      SELECT COUNT(*)
      FROM homework_visibility hv
      WHERE hv.tenant_id = #{tenantId}
        AND hv.homework_id = #{homeworkId}
        AND hv.target_type = 'STUDENT'
        AND hv.target_id = #{studentId}
        AND hv.deleted_at IS NULL
      """)
  int countHomeworkVisibleToStudent(
      @Param("tenantId") Long tenantId,
      @Param("homeworkId") Long homeworkId,
      @Param("studentId") Long studentId
  );

  @Select("""
      SELECT sp.id
      FROM student_profile sp
      WHERE sp.tenant_id = #{tenantId}
        AND sp.user_id = #{userId}
        AND sp.deleted_at IS NULL
      LIMIT 1
      """)
  Long findStudentIdByUser(@Param("tenantId") Long tenantId, @Param("userId") Long userId);

  @Insert("""
      INSERT INTO homework_visibility (id, tenant_id, homework_id, target_type, target_id)
      VALUES (#{id}, #{tenantId}, #{homeworkId}, 'STUDENT', #{studentId})
      """)
  int insertVisibility(
      @Param("id") Long id,
      @Param("tenantId") Long tenantId,
      @Param("homeworkId") Long homeworkId,
      @Param("studentId") Long studentId
  );

  @Insert("""
      INSERT INTO homework_submission (id, tenant_id, homework_id, student_id, content, submitted_at, status)
      VALUES (#{id}, #{tenantId}, #{homeworkId}, #{studentId}, #{content}, CURRENT_TIMESTAMP, 'SUBMITTED')
      """)
  int insertSubmission(
      @Param("id") Long id,
      @Param("tenantId") Long tenantId,
      @Param("homeworkId") Long homeworkId,
      @Param("studentId") Long studentId,
      @Param("content") String content
  );

  @Select("""
      SELECT COUNT(*)
      FROM homework_submission hs
      JOIN homework h
        ON h.id = hs.homework_id
       AND h.deleted_at IS NULL
      WHERE hs.id = #{submissionId}
        AND hs.tenant_id = #{scope.tenantId}
        AND hs.deleted_at IS NULL
        AND (
          #{scope.admin} = TRUE
          OR (#{scope.teacher} = TRUE AND (
            h.teacher_user_id = #{scope.userId}
            OR EXISTS (
              SELECT 1
              FROM lesson l
              JOIN class_teacher ct
                ON ct.class_group_id = l.class_group_id
               AND ct.teacher_user_id = #{scope.userId}
               AND ct.deleted_at IS NULL
              WHERE l.id = h.lesson_id
                AND l.deleted_at IS NULL
            )
          ))
        )
      """)
  int countReviewableSubmission(@Param("scope") DataScope scope, @Param("submissionId") Long submissionId);

  @Select("""
      SELECT id
      FROM homework_review
      WHERE tenant_id = #{tenantId}
        AND submission_id = #{submissionId}
        AND deleted_at IS NULL
      LIMIT 1
      """)
  Long findActiveReviewId(@Param("tenantId") Long tenantId, @Param("submissionId") Long submissionId);

  @Insert("""
      INSERT INTO homework_review (
        id, tenant_id, submission_id, reviewer_user_id, score, comment, mistake_tags,
        needs_correction, excellent, reviewed_at
      )
      VALUES (
        #{id}, #{tenantId}, #{submissionId}, #{reviewerUserId}, #{score}, #{comment}, #{mistakeTags},
        #{needsCorrection}, #{excellent}, CURRENT_TIMESTAMP
      )
      """)
  int insertReview(
      @Param("id") Long id,
      @Param("tenantId") Long tenantId,
      @Param("submissionId") Long submissionId,
      @Param("reviewerUserId") Long reviewerUserId,
      @Param("score") java.math.BigDecimal score,
      @Param("comment") String comment,
      @Param("mistakeTags") String mistakeTags,
      @Param("needsCorrection") Boolean needsCorrection,
      @Param("excellent") Boolean excellent
  );

  @Update("""
      UPDATE homework_review
      SET reviewer_user_id = #{reviewerUserId},
          score = #{score},
          comment = #{comment},
          mistake_tags = #{mistakeTags},
          needs_correction = #{needsCorrection},
          excellent = #{excellent},
          reviewed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = #{reviewId}
        AND tenant_id = #{tenantId}
        AND deleted_at IS NULL
      """)
  int updateReview(
      @Param("tenantId") Long tenantId,
      @Param("reviewId") Long reviewId,
      @Param("reviewerUserId") Long reviewerUserId,
      @Param("score") java.math.BigDecimal score,
      @Param("comment") String comment,
      @Param("mistakeTags") String mistakeTags,
      @Param("needsCorrection") Boolean needsCorrection,
      @Param("excellent") Boolean excellent
  );

  @Update("""
      UPDATE homework_submission
      SET status = 'REVIEWED',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = #{submissionId}
        AND tenant_id = #{tenantId}
        AND deleted_at IS NULL
      """)
  int markSubmissionReviewed(@Param("tenantId") Long tenantId, @Param("submissionId") Long submissionId);

  @Select("""
      SELECT sp.user_id
      FROM homework_submission hs
      JOIN student_profile sp
        ON sp.id = hs.student_id
       AND sp.deleted_at IS NULL
      WHERE hs.id = #{submissionId}
        AND hs.tenant_id = #{tenantId}
        AND hs.deleted_at IS NULL
      LIMIT 1
      """)
  Long findSubmissionStudentUserId(@Param("tenantId") Long tenantId, @Param("submissionId") Long submissionId);

  @Insert("""
      INSERT INTO notification_task (id, tenant_id, target_user_id, channel, title, content, scheduled_at, status)
      VALUES (#{id}, #{tenantId}, #{targetUserId}, 'IN_APP', #{title}, #{content}, CURRENT_TIMESTAMP, 'PENDING')
      """)
  int insertNotification(
      @Param("id") Long id,
      @Param("tenantId") Long tenantId,
      @Param("targetUserId") Long targetUserId,
      @Param("title") String title,
      @Param("content") String content
  );
}
