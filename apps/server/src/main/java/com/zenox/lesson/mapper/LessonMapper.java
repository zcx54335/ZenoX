package com.zenox.lesson.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zenox.common.security.DataScope;
import com.zenox.lesson.entity.Lesson;
import com.zenox.lesson.dto.LessonBillingMember;
import com.zenox.lesson.dto.LessonScheduleItem;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface LessonMapper extends BaseMapper<Lesson> {
  @Select("""
      SELECT
        id,
        tenant_id AS tenantId,
        class_group_id AS classGroupId,
        teacher_user_id AS teacherUserId,
        subject,
        topic,
        starts_at AS startsAt,
        ends_at AS endsAt,
        lesson_hours AS lessonHours,
        unit_price AS unitPrice,
        delivery_mode AS deliveryMode,
        status,
        created_at AS createdAt,
        updated_at AS updatedAt,
        deleted_at AS deletedAt
      FROM lesson
      WHERE tenant_id = #{tenantId}
        AND deleted_at IS NULL
      ORDER BY starts_at ASC
      """)
  List<Lesson> listByTenantId(Long tenantId);

  @Select("""
      SELECT
        l.id,
        l.class_group_id AS classGroupId,
        cg.name AS classGroupName,
        l.teacher_user_id AS teacherUserId,
        l.subject,
        l.topic,
        l.starts_at AS startsAt,
        l.ends_at AS endsAt,
        l.lesson_hours AS lessonHours,
        l.unit_price AS unitPrice,
        l.delivery_mode AS deliveryMode,
        l.status,
        COUNT(cm.id) AS studentCount
      FROM lesson l
      LEFT JOIN class_group cg
        ON cg.id = l.class_group_id
       AND cg.deleted_at IS NULL
      LEFT JOIN class_member cm
        ON cm.class_group_id = l.class_group_id
       AND cm.deleted_at IS NULL
      WHERE l.tenant_id = #{scope.tenantId}
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
          OR (#{scope.student} = TRUE AND EXISTS (
            SELECT 1
            FROM class_member scoped_cm
            JOIN student_profile scoped_sp
              ON scoped_sp.id = scoped_cm.student_id
             AND scoped_sp.user_id = #{scope.userId}
             AND scoped_sp.deleted_at IS NULL
            WHERE scoped_cm.class_group_id = l.class_group_id
              AND scoped_cm.deleted_at IS NULL
          ))
          OR (#{scope.parent} = TRUE AND EXISTS (
            SELECT 1
            FROM class_member scoped_cm
            JOIN parent_student scoped_ps
              ON scoped_ps.student_id = scoped_cm.student_id
             AND scoped_ps.deleted_at IS NULL
            JOIN parent_profile scoped_pp
              ON scoped_pp.id = scoped_ps.parent_id
             AND scoped_pp.user_id = #{scope.userId}
             AND scoped_pp.deleted_at IS NULL
            WHERE scoped_cm.class_group_id = l.class_group_id
              AND scoped_cm.deleted_at IS NULL
          ))
        )
      GROUP BY
        l.id,
        l.class_group_id,
        cg.name,
        l.teacher_user_id,
        l.subject,
        l.topic,
        l.starts_at,
        l.ends_at,
        l.lesson_hours,
        l.unit_price,
        l.delivery_mode,
        l.status
      ORDER BY l.starts_at ASC
      """)
  List<LessonScheduleItem> listScheduleByScope(@Param("scope") DataScope scope);

  @Select("""
      SELECT
        l.id,
        l.class_group_id AS classGroupId,
        cg.name AS classGroupName,
        l.teacher_user_id AS teacherUserId,
        l.subject,
        l.topic,
        l.starts_at AS startsAt,
        l.ends_at AS endsAt,
        l.lesson_hours AS lessonHours,
        l.unit_price AS unitPrice,
        l.delivery_mode AS deliveryMode,
        l.status,
        COUNT(cm.id) AS studentCount
      FROM lesson l
      LEFT JOIN class_group cg
        ON cg.id = l.class_group_id
       AND cg.deleted_at IS NULL
      LEFT JOIN class_member cm
        ON cm.class_group_id = l.class_group_id
       AND cm.deleted_at IS NULL
      WHERE l.tenant_id = #{scope.tenantId}
        AND l.deleted_at IS NULL
        AND l.starts_at >= #{startsAt}
        AND l.starts_at < #{endsAt}
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
          OR (#{scope.student} = TRUE AND EXISTS (
            SELECT 1
            FROM class_member scoped_cm
            JOIN student_profile scoped_sp
              ON scoped_sp.id = scoped_cm.student_id
             AND scoped_sp.user_id = #{scope.userId}
             AND scoped_sp.deleted_at IS NULL
            WHERE scoped_cm.class_group_id = l.class_group_id
              AND scoped_cm.deleted_at IS NULL
          ))
          OR (#{scope.parent} = TRUE AND EXISTS (
            SELECT 1
            FROM class_member scoped_cm
            JOIN parent_student scoped_ps
              ON scoped_ps.student_id = scoped_cm.student_id
             AND scoped_ps.deleted_at IS NULL
            JOIN parent_profile scoped_pp
              ON scoped_pp.id = scoped_ps.parent_id
             AND scoped_pp.user_id = #{scope.userId}
             AND scoped_pp.deleted_at IS NULL
            WHERE scoped_cm.class_group_id = l.class_group_id
              AND scoped_cm.deleted_at IS NULL
          ))
        )
      GROUP BY
        l.id,
        l.class_group_id,
        cg.name,
        l.teacher_user_id,
        l.subject,
        l.topic,
        l.starts_at,
        l.ends_at,
        l.lesson_hours,
        l.unit_price,
        l.delivery_mode,
        l.status
      ORDER BY l.starts_at ASC
      """)
  List<LessonScheduleItem> listScheduleByScopeAndRange(
      @Param("scope") DataScope scope,
      @Param("startsAt") java.time.LocalDateTime startsAt,
      @Param("endsAt") java.time.LocalDateTime endsAt
  );

  @Select("""
      SELECT
        id,
        tenant_id AS tenantId,
        class_group_id AS classGroupId,
        teacher_user_id AS teacherUserId,
        subject,
        topic,
        starts_at AS startsAt,
        ends_at AS endsAt,
        lesson_hours AS lessonHours,
        unit_price AS unitPrice,
        delivery_mode AS deliveryMode,
        status,
        created_at AS createdAt,
        updated_at AS updatedAt,
        deleted_at AS deletedAt
      FROM lesson
      WHERE id = #{id}
        AND tenant_id = #{tenantId}
        AND deleted_at IS NULL
      LIMIT 1
      """)
  Lesson findByIdAndTenantId(@Param("id") Long id, @Param("tenantId") Long tenantId);

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
  int countVisibleClassForScheduling(@Param("scope") DataScope scope, @Param("classGroupId") Long classGroupId);

  @Select("""
      SELECT COUNT(*)
      FROM lesson
      WHERE tenant_id = #{tenantId}
        AND teacher_user_id = #{teacherUserId}
        AND deleted_at IS NULL
        AND status <> 'CANCELLED'
        AND (#{excludedLessonId} IS NULL OR id <> #{excludedLessonId})
        AND starts_at < #{endsAt}
        AND ends_at > #{startsAt}
      """)
  int countTeacherConflicts(
      @Param("tenantId") Long tenantId,
      @Param("teacherUserId") Long teacherUserId,
      @Param("startsAt") java.time.LocalDateTime startsAt,
      @Param("endsAt") java.time.LocalDateTime endsAt,
      @Param("excludedLessonId") Long excludedLessonId
  );

  @Select("""
      SELECT COUNT(*)
      FROM lesson
      WHERE tenant_id = #{tenantId}
        AND class_group_id = #{classGroupId}
        AND deleted_at IS NULL
        AND status <> 'CANCELLED'
        AND (#{excludedLessonId} IS NULL OR id <> #{excludedLessonId})
        AND starts_at < #{endsAt}
        AND ends_at > #{startsAt}
      """)
  int countClassConflicts(
      @Param("tenantId") Long tenantId,
      @Param("classGroupId") Long classGroupId,
      @Param("startsAt") java.time.LocalDateTime startsAt,
      @Param("endsAt") java.time.LocalDateTime endsAt,
      @Param("excludedLessonId") Long excludedLessonId
  );

  @Select("""
      SELECT COUNT(DISTINCT l.id)
      FROM lesson l
      JOIN class_member existing_member
        ON existing_member.class_group_id = l.class_group_id
       AND existing_member.deleted_at IS NULL
      JOIN class_member target_member
        ON target_member.student_id = existing_member.student_id
       AND target_member.class_group_id = #{classGroupId}
       AND target_member.deleted_at IS NULL
      WHERE l.tenant_id = #{tenantId}
        AND l.deleted_at IS NULL
        AND l.status <> 'CANCELLED'
        AND (#{excludedLessonId} IS NULL OR l.id <> #{excludedLessonId})
        AND l.starts_at < #{endsAt}
        AND l.ends_at > #{startsAt}
      """)
  int countStudentConflicts(
      @Param("tenantId") Long tenantId,
      @Param("classGroupId") Long classGroupId,
      @Param("startsAt") java.time.LocalDateTime startsAt,
      @Param("endsAt") java.time.LocalDateTime endsAt,
      @Param("excludedLessonId") Long excludedLessonId
  );

  @Update("""
      UPDATE lesson
      SET status = 'COMPLETED',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = #{id}
        AND tenant_id = #{tenantId}
        AND deleted_at IS NULL
      """)
  int markCompleted(@Param("id") Long id, @Param("tenantId") Long tenantId);

  @Insert("""
      INSERT INTO lesson_attendance (id, tenant_id, lesson_id, student_id, status, teacher_comment)
      SELECT
        900000000000000000 + l.id + cm.id AS id,
        l.tenant_id,
        l.id,
        cm.student_id,
        'PRESENT',
        '课程已完成，等待老师补充学生总结。'
      FROM lesson l
      JOIN class_member cm
        ON cm.class_group_id = l.class_group_id
       AND cm.deleted_at IS NULL
      LEFT JOIN lesson_attendance la
        ON la.lesson_id = l.id
       AND la.student_id = cm.student_id
       AND la.deleted_at IS NULL
      WHERE l.id = #{lessonId}
        AND l.tenant_id = #{tenantId}
        AND l.deleted_at IS NULL
        AND la.id IS NULL
      """)
  int insertAttendanceForClassMembers(@Param("lessonId") Long lessonId, @Param("tenantId") Long tenantId);

  @Update("""
      UPDATE lesson_attendance la
      JOIN lesson l
        ON l.id = la.lesson_id
       AND l.deleted_at IS NULL
      JOIN class_member cm
        ON cm.class_group_id = l.class_group_id
       AND cm.student_id = la.student_id
       AND cm.deleted_at IS NULL
      SET la.status = 'PRESENT',
          la.teacher_comment = COALESCE(la.teacher_comment, '课程已完成，等待老师补充学生总结。'),
          la.deleted_at = NULL,
          la.updated_at = CURRENT_TIMESTAMP
      WHERE l.id = #{lessonId}
        AND l.tenant_id = #{tenantId}
        AND la.deleted_at IS NOT NULL
      """)
  int reactivateAttendanceForClassMembers(@Param("lessonId") Long lessonId, @Param("tenantId") Long tenantId);

  @Update("""
      UPDATE student_profile sp
      JOIN class_member cm
        ON cm.student_id = sp.id
       AND cm.deleted_at IS NULL
      JOIN lesson l
        ON l.class_group_id = cm.class_group_id
       AND l.deleted_at IS NULL
      SET sp.remaining_lessons = GREATEST(0, sp.remaining_lessons - l.lesson_hours),
          sp.updated_at = CURRENT_TIMESTAMP
      WHERE l.id = #{lessonId}
        AND l.tenant_id = #{tenantId}
        AND sp.deleted_at IS NULL
      """)
  int deductRemainingLessonsForClassMembers(@Param("lessonId") Long lessonId, @Param("tenantId") Long tenantId);

  @Select("""
      SELECT
        cm.student_id AS studentId,
        cg.name AS classGroupName,
        l.subject,
        l.topic,
        l.starts_at AS startsAt,
        l.lesson_hours AS lessonHours,
        l.unit_price AS unitPrice
      FROM lesson l
      JOIN class_group cg
        ON cg.id = l.class_group_id
       AND cg.deleted_at IS NULL
      JOIN class_member cm
        ON cm.class_group_id = l.class_group_id
       AND cm.deleted_at IS NULL
      JOIN student_profile sp
        ON sp.id = cm.student_id
       AND sp.deleted_at IS NULL
      WHERE l.id = #{lessonId}
        AND l.tenant_id = #{tenantId}
        AND l.deleted_at IS NULL
      ORDER BY sp.name ASC
      """)
  List<LessonBillingMember> listBillingMembersForLesson(@Param("lessonId") Long lessonId, @Param("tenantId") Long tenantId);

  @Select("""
      SELECT id
      FROM billing_cycle
      WHERE tenant_id = #{tenantId}
        AND student_id = #{studentId}
        AND cycle_month = #{cycleMonth}
        AND deleted_at IS NULL
      LIMIT 1
      """)
  Long findBillingCycleId(
      @Param("tenantId") Long tenantId,
      @Param("studentId") Long studentId,
      @Param("cycleMonth") LocalDate cycleMonth
  );

  @Insert("""
      INSERT INTO billing_cycle (id, tenant_id, student_id, cycle_month, total_amount, status)
      VALUES (#{id}, #{tenantId}, #{studentId}, #{cycleMonth}, 0, 'DRAFT')
      """)
  int insertBillingCycle(
      @Param("id") Long id,
      @Param("tenantId") Long tenantId,
      @Param("studentId") Long studentId,
      @Param("cycleMonth") LocalDate cycleMonth
  );

  @Select("""
      SELECT id
      FROM billing_item
      WHERE tenant_id = #{tenantId}
        AND billing_cycle_id = #{billingCycleId}
        AND lesson_id = #{lessonId}
        AND deleted_at IS NULL
      LIMIT 1
      """)
  Long findActiveBillingItemId(
      @Param("tenantId") Long tenantId,
      @Param("billingCycleId") Long billingCycleId,
      @Param("lessonId") Long lessonId
  );

  @Insert("""
      INSERT INTO billing_item (id, tenant_id, billing_cycle_id, lesson_id, title, amount)
      VALUES (#{id}, #{tenantId}, #{billingCycleId}, #{lessonId}, #{title}, #{amount})
      """)
  int insertBillingItem(
      @Param("id") Long id,
      @Param("tenantId") Long tenantId,
      @Param("billingCycleId") Long billingCycleId,
      @Param("lessonId") Long lessonId,
      @Param("title") String title,
      @Param("amount") BigDecimal amount
  );

  @Select("""
      SELECT DISTINCT billing_cycle_id
      FROM billing_item
      WHERE tenant_id = #{tenantId}
        AND lesson_id = #{lessonId}
        AND deleted_at IS NULL
      """)
  List<Long> listBillingCycleIdsByLesson(@Param("tenantId") Long tenantId, @Param("lessonId") Long lessonId);

  @Update("""
      UPDATE billing_item
      SET deleted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE tenant_id = #{tenantId}
        AND lesson_id = #{lessonId}
        AND deleted_at IS NULL
      """)
  int softDeleteBillingItemsByLesson(@Param("tenantId") Long tenantId, @Param("lessonId") Long lessonId);

  @Update("""
      UPDATE student_profile sp
      JOIN lesson_attendance la
        ON la.student_id = sp.id
       AND la.deleted_at IS NULL
      JOIN lesson l
        ON l.id = la.lesson_id
       AND l.deleted_at IS NULL
      SET sp.remaining_lessons = sp.remaining_lessons + l.lesson_hours,
          sp.updated_at = CURRENT_TIMESTAMP
      WHERE l.id = #{lessonId}
        AND l.tenant_id = #{tenantId}
        AND sp.deleted_at IS NULL
      """)
  int restoreRemainingLessonsForAttendanceStudents(@Param("lessonId") Long lessonId, @Param("tenantId") Long tenantId);

  @Update("""
      UPDATE lesson_attendance
      SET deleted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE tenant_id = #{tenantId}
        AND lesson_id = #{lessonId}
        AND deleted_at IS NULL
      """)
  int softDeleteAttendanceByLesson(@Param("lessonId") Long lessonId, @Param("tenantId") Long tenantId);

  @Update("""
      UPDATE billing_cycle bc
      LEFT JOIN (
        SELECT billing_cycle_id, COALESCE(SUM(amount), 0) AS total_amount
        FROM billing_item
        WHERE deleted_at IS NULL
          AND billing_cycle_id = #{billingCycleId}
        GROUP BY billing_cycle_id
      ) items
        ON items.billing_cycle_id = bc.id
      LEFT JOIN (
        SELECT billing_cycle_id, COALESCE(SUM(amount), 0) AS paid_amount
        FROM payment_record
        WHERE deleted_at IS NULL
          AND billing_cycle_id = #{billingCycleId}
        GROUP BY billing_cycle_id
      ) payments
        ON payments.billing_cycle_id = bc.id
      SET bc.total_amount = COALESCE(items.total_amount, 0),
          bc.status = CASE
            WHEN COALESCE(items.total_amount, 0) = 0 AND COALESCE(payments.paid_amount, 0) = 0 THEN 'DRAFT'
            WHEN COALESCE(payments.paid_amount, 0) = 0 THEN 'DRAFT'
            WHEN COALESCE(payments.paid_amount, 0) >= COALESCE(items.total_amount, 0) THEN 'PAID'
            ELSE 'PARTIALLY_PAID'
          END,
          bc.updated_at = CURRENT_TIMESTAMP
      WHERE bc.id = #{billingCycleId}
        AND bc.tenant_id = #{tenantId}
        AND bc.deleted_at IS NULL
      """)
  int recalculateBillingCycle(@Param("tenantId") Long tenantId, @Param("billingCycleId") Long billingCycleId);
}
