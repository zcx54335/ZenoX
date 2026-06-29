package com.zenox.lesson.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zenox.lesson.entity.Lesson;
import com.zenox.lesson.dto.LessonScheduleItem;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

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
      WHERE l.tenant_id = #{tenantId}
        AND l.deleted_at IS NULL
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
  List<LessonScheduleItem> listScheduleByTenantId(Long tenantId);

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
      WHERE l.tenant_id = #{tenantId}
        AND l.deleted_at IS NULL
        AND l.starts_at >= #{startsAt}
        AND l.starts_at < #{endsAt}
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
  List<LessonScheduleItem> listScheduleByTenantIdAndRange(
      @Param("tenantId") Long tenantId,
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
}
