package com.zenox.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zenox.user.dto.TeacherProfileSummary;
import com.zenox.user.entity.UserAccount;
import java.util.List;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface UserAccountMapper extends BaseMapper<UserAccount> {
  @Select("""
      SELECT
        id,
        tenant_id AS tenantId,
        username,
        password_hash AS passwordHash,
        display_name AS displayName,
        role,
        status,
        last_login_at AS lastLoginAt,
        created_at AS createdAt,
        updated_at AS updatedAt,
        deleted_at AS deletedAt
      FROM user_account
      WHERE username = #{username}
        AND deleted_at IS NULL
      LIMIT 1
      """)
  UserAccount findByUsername(String username);

  @Select("""
      SELECT
        ua.id AS userId,
        tp.id AS profileId,
        ua.username,
        ua.display_name AS displayName,
        ua.role,
        tp.subject,
        tp.phone,
        tp.bio,
        GROUP_CONCAT(DISTINCT cg.name ORDER BY cg.name SEPARATOR '、') AS classNames
      FROM user_account ua
      LEFT JOIN teacher_profile tp
        ON tp.user_id = ua.id
       AND tp.deleted_at IS NULL
      LEFT JOIN class_teacher ct
        ON ct.teacher_user_id = ua.id
       AND ct.deleted_at IS NULL
      LEFT JOIN class_group cg
        ON cg.id = ct.class_group_id
       AND cg.deleted_at IS NULL
      WHERE ua.tenant_id = #{tenantId}
        AND ua.deleted_at IS NULL
        AND ua.role IN ('TENANT_OWNER', 'TEACHER')
      GROUP BY
        ua.id,
        tp.id,
        ua.username,
        ua.display_name,
        ua.role,
        tp.subject,
        tp.phone,
        tp.bio
      ORDER BY FIELD(ua.role, 'TENANT_OWNER', 'TEACHER'), ua.created_at DESC
      """)
  List<TeacherProfileSummary> listTeachersByTenantId(Long tenantId);

  @Select("""
      SELECT COUNT(*)
      FROM user_account
      WHERE username = #{username}
        AND deleted_at IS NULL
      """)
  int countActiveUsername(String username);

  @Insert("""
      INSERT INTO teacher_profile (id, tenant_id, user_id, display_name, subject, phone, bio)
      VALUES (#{id}, #{tenantId}, #{userId}, #{displayName}, #{subject}, #{phone}, #{bio})
      """)
  int insertTeacherProfile(
      @Param("id") Long id,
      @Param("tenantId") Long tenantId,
      @Param("userId") Long userId,
      @Param("displayName") String displayName,
      @Param("subject") String subject,
      @Param("phone") String phone,
      @Param("bio") String bio
  );

  @Update("""
      UPDATE user_account
      SET deleted_at = CURRENT_TIMESTAMP,
          status = 'DISABLED',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = #{teacherUserId}
        AND tenant_id = #{tenantId}
        AND role = 'TEACHER'
        AND deleted_at IS NULL
      """)
  int softDeleteTeacherUser(@Param("tenantId") Long tenantId, @Param("teacherUserId") Long teacherUserId);

  @Update("""
      UPDATE teacher_profile
      SET deleted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE tenant_id = #{tenantId}
        AND user_id = #{teacherUserId}
        AND deleted_at IS NULL
      """)
  int softDeleteTeacherProfile(@Param("tenantId") Long tenantId, @Param("teacherUserId") Long teacherUserId);

  @Update("""
      UPDATE class_teacher
      SET deleted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE tenant_id = #{tenantId}
        AND teacher_user_id = #{teacherUserId}
        AND deleted_at IS NULL
      """)
  int softDeleteTeacherClassBindings(@Param("tenantId") Long tenantId, @Param("teacherUserId") Long teacherUserId);
}
