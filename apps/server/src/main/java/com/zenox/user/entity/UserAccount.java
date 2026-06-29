package com.zenox.user.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zenox.common.enums.UserRole;
import com.zenox.common.enums.UserStatus;
import java.time.LocalDateTime;
import lombok.Data;

@Data
@TableName("user_account")
public class UserAccount {
  private Long id;
  private Long tenantId;
  private String username;
  private String passwordHash;
  private String displayName;
  private UserRole role;
  private UserStatus status;
  private LocalDateTime lastLoginAt;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private LocalDateTime deletedAt;
}
