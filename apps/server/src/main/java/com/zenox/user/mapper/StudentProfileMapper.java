package com.zenox.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zenox.user.entity.StudentProfile;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface StudentProfileMapper extends BaseMapper<StudentProfile> {
  @Select("""
      SELECT
        id,
        tenant_id AS tenantId,
        name,
        grade,
        school,
        subject,
        parent_name AS parentName,
        parent_phone AS parentPhone,
        remaining_lessons AS remainingLessons,
        weakness_note AS weaknessNote,
        created_at AS createdAt,
        updated_at AS updatedAt,
        deleted_at AS deletedAt
      FROM student_profile
      WHERE tenant_id = #{tenantId}
        AND deleted_at IS NULL
      ORDER BY created_at DESC
      """)
  List<StudentProfile> listByTenantId(Long tenantId);
}
