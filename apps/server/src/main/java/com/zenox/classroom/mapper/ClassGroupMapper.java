package com.zenox.classroom.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zenox.classroom.entity.ClassGroup;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

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
      WHERE tenant_id = #{tenantId}
        AND deleted_at IS NULL
      ORDER BY created_at DESC
      """)
  List<ClassGroup> listByTenantId(Long tenantId);
}
