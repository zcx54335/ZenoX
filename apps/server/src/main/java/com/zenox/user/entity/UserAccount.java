package com.zenox.user.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.zenox.common.enums.UserRole;
import com.zenox.common.enums.UserStatus;
import java.time.LocalDateTime;
import lombok.Data;

@Data
@TableName("user_account")
public class UserAccount {
  @TableId
  private Long id;
  @TableField("tenant_id")
  private Long tenantId;
  private String username;
  @TableField("password_hash")
  private String passwordHash;
  @TableField("display_name")
  private String displayName;
  private UserRole role;
  private UserStatus status;
  @TableField("last_login_at")
  private LocalDateTime lastLoginAt;
  @TableField("created_at")
  private LocalDateTime createdAt;
  @TableField("updated_at")
  private LocalDateTime updatedAt;
  @TableField("deleted_at")
  private LocalDateTime deletedAt;
}
