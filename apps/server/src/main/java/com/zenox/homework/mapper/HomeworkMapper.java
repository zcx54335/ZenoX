package com.zenox.homework.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zenox.homework.entity.Homework;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface HomeworkMapper extends BaseMapper<Homework> {
  @Select("""
      SELECT
        id,
        tenant_id AS tenantId,
        lesson_id AS lessonId,
        teacher_user_id AS teacherUserId,
        title,
        content,
        due_at AS dueAt,
        status,
        created_at AS createdAt,
        updated_at AS updatedAt,
        deleted_at AS deletedAt
      FROM homework
      WHERE tenant_id = #{tenantId}
        AND deleted_at IS NULL
      ORDER BY created_at DESC
      """)
  List<Homework> listByTenantId(Long tenantId);
}
