package com.zenox.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zenox.user.entity.UserAccount;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

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
}
