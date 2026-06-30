package com.zenox.classroom.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zenox.classroom.dto.ClassMemberSummary;
import com.zenox.classroom.dto.ClassTeacherSummary;
import com.zenox.classroom.entity.ClassGroup;
import com.zenox.common.security.DataScope;
import java.util.List;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface ClassGroupMapper extends BaseMapper<ClassGroup> {
  @Select("""
      SELECT
        id,
        tenant_id AS tenantId,
        name,
        subject,
        grade,
        description,
        created_at AS createdAt,
        updated_at AS updatedAt,
        deleted_at AS deletedAt
      FROM class_group
      WHERE tenant_id = #{scope.tenantId}
        AND deleted_at IS NULL
        AND (
          #{scope.admin} = TRUE
          OR (#{scope.teacher} = TRUE AND EXISTS (
            SELECT 1
            FROM class_teacher ct
            WHERE ct.class_group_id = class_group.id
              AND ct.teacher_user_id = #{scope.userId}
              AND ct.deleted_at IS NULL
          ))
        )
      ORDER BY created_at DESC
      """)
  List<ClassGroup> listByScope(@Param("scope") DataScope scope);

  @Select("""
      SELECT
        id,
        tenant_id AS tenantId,
        name,
        subject,
        grade,
        description,
        created_at AS createdAt,
        updated_at AS updatedAt,
        deleted_at AS deletedAt
      FROM class_group
      WHERE id = #{classGroupId}
        AND tenant_id = #{tenantId}
        AND deleted_at IS NULL
      LIMIT 1
      """)
  ClassGroup findByIdAndTenantId(@Param("classGroupId") Long classGroupId, @Param("tenantId") Long tenantId);

  @Select("""
      SELECT
        id,
        tenant_id AS tenantId,
        name,
        subject,
        grade,
        description,
        created_at AS createdAt,
        updated_at AS updatedAt,
        deleted_at AS deletedAt
      FROM class_group
      WHERE id = #{classGroupId}
        AND tenant_id = #{scope.tenantId}
        AND deleted_at IS NULL
        AND (
          #{scope.admin} = TRUE
          OR (#{scope.teacher} = TRUE AND EXISTS (
            SELECT 1
            FROM class_teacher ct
            WHERE ct.class_group_id = class_group.id
              AND ct.teacher_user_id = #{scope.userId}
              AND ct.deleted_at IS NULL
          ))
        )
      LIMIT 1
      """)
  ClassGroup findByIdAndScope(@Param("classGroupId") Long classGroupId, @Param("scope") DataScope scope);

  @Select("""
      SELECT
        sp.id,
        sp.name,
        sp.grade,
        sp.subject,
        sp.parent_name AS parentName,
        sp.parent_phone AS parentPhone,
        sp.remaining_lessons AS remainingLessons,
        sp.weakness_note AS weaknessNote,
        GROUP_CONCAT(DISTINCT cg.name ORDER BY cg.name SEPARATOR '、') AS classNames
      FROM student_profile sp
      JOIN class_member active_cm
        ON active_cm.student_id = sp.id
       AND active_cm.class_group_id = #{classGroupId}
       AND active_cm.deleted_at IS NULL
      LEFT JOIN class_member cm
        ON cm.student_id = sp.id
       AND cm.deleted_at IS NULL
      LEFT JOIN class_group cg
        ON cg.id = cm.class_group_id
       AND cg.deleted_at IS NULL
      WHERE sp.tenant_id = #{tenantId}
        AND sp.deleted_at IS NULL
      GROUP BY
        sp.id,
        sp.name,
        sp.grade,
        sp.subject,
        sp.parent_name,
        sp.parent_phone,
        sp.remaining_lessons,
        sp.weakness_note
      ORDER BY sp.name ASC
      """)
  List<ClassMemberSummary> listClassStudents(
      @Param("tenantId") Long tenantId,
      @Param("classGroupId") Long classGroupId
  );

  @Select("""
      SELECT
        sp.id,
        sp.name,
        sp.grade,
        sp.subject,
        sp.parent_name AS parentName,
        sp.parent_phone AS parentPhone,
        sp.remaining_lessons AS remainingLessons,
        sp.weakness_note AS weaknessNote,
        GROUP_CONCAT(DISTINCT cg.name ORDER BY cg.name SEPARATOR '、') AS classNames
      FROM student_profile sp
      LEFT JOIN class_member active_cm
        ON active_cm.student_id = sp.id
       AND active_cm.class_group_id = #{classGroupId}
       AND active_cm.deleted_at IS NULL
      LEFT JOIN class_member cm
        ON cm.student_id = sp.id
       AND cm.deleted_at IS NULL
      LEFT JOIN class_group cg
        ON cg.id = cm.class_group_id
       AND cg.deleted_at IS NULL
      WHERE sp.tenant_id = #{tenantId}
        AND sp.deleted_at IS NULL
        AND active_cm.id IS NULL
      GROUP BY
        sp.id,
        sp.name,
        sp.grade,
        sp.subject,
        sp.parent_name,
        sp.parent_phone,
        sp.remaining_lessons,
        sp.weakness_note
      ORDER BY sp.created_at DESC
      """)
  List<ClassMemberSummary> listAvailableStudents(
      @Param("tenantId") Long tenantId,
      @Param("classGroupId") Long classGroupId
  );

  @Select("""
      SELECT
        ua.id AS userId,
        ua.display_name AS displayName,
        ua.role,
        tp.subject,
        tp.phone
      FROM class_teacher ct
      JOIN user_account ua
        ON ua.id = ct.teacher_user_id
       AND ua.deleted_at IS NULL
      LEFT JOIN teacher_profile tp
        ON tp.user_id = ua.id
       AND tp.deleted_at IS NULL
      WHERE ct.tenant_id = #{tenantId}
        AND ct.class_group_id = #{classGroupId}
        AND ct.deleted_at IS NULL
      ORDER BY ua.display_name ASC
      """)
  List<ClassTeacherSummary> listClassTeachers(
      @Param("tenantId") Long tenantId,
      @Param("classGroupId") Long classGroupId
  );

  @Select("""
      SELECT
        ua.id AS userId,
        ua.display_name AS displayName,
        ua.role,
        tp.subject,
        tp.phone
      FROM user_account ua
      LEFT JOIN teacher_profile tp
        ON tp.user_id = ua.id
       AND tp.deleted_at IS NULL
      LEFT JOIN class_teacher active_ct
        ON active_ct.teacher_user_id = ua.id
       AND active_ct.class_group_id = #{classGroupId}
       AND active_ct.deleted_at IS NULL
      WHERE ua.tenant_id = #{tenantId}
        AND ua.deleted_at IS NULL
        AND ua.status = 'ACTIVE'
        AND ua.role IN ('TENANT_OWNER', 'TEACHER')
        AND active_ct.id IS NULL
      ORDER BY FIELD(ua.role, 'TENANT_OWNER', 'TEACHER'), ua.display_name ASC
      """)
  List<ClassTeacherSummary> listAvailableTeachers(
      @Param("tenantId") Long tenantId,
      @Param("classGroupId") Long classGroupId
  );

  @Select("""
      SELECT COUNT(*)
      FROM student_profile
      WHERE id = #{studentId}
        AND tenant_id = #{tenantId}
        AND deleted_at IS NULL
      """)
  int countStudentByTenant(@Param("tenantId") Long tenantId, @Param("studentId") Long studentId);

  @Select("""
      SELECT COUNT(*)
      FROM user_account
      WHERE id = #{teacherUserId}
        AND tenant_id = #{tenantId}
        AND deleted_at IS NULL
        AND status = 'ACTIVE'
        AND role IN ('TENANT_OWNER', 'TEACHER')
      """)
  int countTeacherByTenant(@Param("tenantId") Long tenantId, @Param("teacherUserId") Long teacherUserId);

  @Select("""
      SELECT COUNT(*)
      FROM class_member
      WHERE tenant_id = #{tenantId}
        AND class_group_id = #{classGroupId}
        AND student_id = #{studentId}
        AND deleted_at IS NULL
      """)
  int countActiveStudentMember(
      @Param("tenantId") Long tenantId,
      @Param("classGroupId") Long classGroupId,
      @Param("studentId") Long studentId
  );

  @Select("""
      SELECT COUNT(*)
      FROM class_member
      WHERE tenant_id = #{tenantId}
        AND student_id = #{studentId}
        AND class_group_id <> #{classGroupId}
        AND deleted_at IS NULL
      """)
  int countOtherActiveStudentMemberships(
      @Param("tenantId") Long tenantId,
      @Param("classGroupId") Long classGroupId,
      @Param("studentId") Long studentId
  );

  @Select("""
      SELECT id
      FROM class_member
      WHERE tenant_id = #{tenantId}
        AND class_group_id = #{classGroupId}
        AND student_id = #{studentId}
      LIMIT 1
      """)
  Long findStudentMemberIdIncludingDeleted(
      @Param("tenantId") Long tenantId,
      @Param("classGroupId") Long classGroupId,
      @Param("studentId") Long studentId
  );

  @Insert("""
      INSERT INTO class_member (id, tenant_id, class_group_id, student_id)
      VALUES (#{id}, #{tenantId}, #{classGroupId}, #{studentId})
      """)
  int insertStudentMember(
      @Param("id") Long id,
      @Param("tenantId") Long tenantId,
      @Param("classGroupId") Long classGroupId,
      @Param("studentId") Long studentId
  );

  @Update("""
      UPDATE class_member
      SET deleted_at = NULL,
          joined_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = #{id}
        AND tenant_id = #{tenantId}
      """)
  int restoreStudentMember(@Param("id") Long id, @Param("tenantId") Long tenantId);

  @Update("""
      UPDATE class_member
      SET deleted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE tenant_id = #{tenantId}
        AND class_group_id = #{classGroupId}
        AND student_id = #{studentId}
        AND deleted_at IS NULL
      """)
  int removeStudentMember(
      @Param("tenantId") Long tenantId,
      @Param("classGroupId") Long classGroupId,
      @Param("studentId") Long studentId
  );

  @Select("""
      SELECT COUNT(*)
      FROM class_teacher
      WHERE tenant_id = #{tenantId}
        AND class_group_id = #{classGroupId}
        AND teacher_user_id = #{teacherUserId}
        AND deleted_at IS NULL
      """)
  int countActiveClassTeacher(
      @Param("tenantId") Long tenantId,
      @Param("classGroupId") Long classGroupId,
      @Param("teacherUserId") Long teacherUserId
  );

  @Select("""
      SELECT id
      FROM class_teacher
      WHERE tenant_id = #{tenantId}
        AND class_group_id = #{classGroupId}
        AND teacher_user_id = #{teacherUserId}
      LIMIT 1
      """)
  Long findClassTeacherIdIncludingDeleted(
      @Param("tenantId") Long tenantId,
      @Param("classGroupId") Long classGroupId,
      @Param("teacherUserId") Long teacherUserId
  );

  @Insert("""
      INSERT INTO class_teacher (id, tenant_id, class_group_id, teacher_user_id, role_in_class)
      VALUES (#{id}, #{tenantId}, #{classGroupId}, #{teacherUserId}, '主讲老师')
      """)
  int insertClassTeacher(
      @Param("id") Long id,
      @Param("tenantId") Long tenantId,
      @Param("classGroupId") Long classGroupId,
      @Param("teacherUserId") Long teacherUserId
  );

  @Update("""
      UPDATE class_teacher
      SET deleted_at = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = #{id}
        AND tenant_id = #{tenantId}
      """)
  int restoreClassTeacher(@Param("id") Long id, @Param("tenantId") Long tenantId);

  @Update("""
      UPDATE class_teacher
      SET deleted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE tenant_id = #{tenantId}
        AND class_group_id = #{classGroupId}
        AND teacher_user_id = #{teacherUserId}
        AND deleted_at IS NULL
      """)
  int removeClassTeacher(
      @Param("tenantId") Long tenantId,
      @Param("classGroupId") Long classGroupId,
      @Param("teacherUserId") Long teacherUserId
  );
}
