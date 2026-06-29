package com.zenox.auth.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.zenox.common.enums.UserRole;
import java.time.LocalDateTime;
import lombok.Data;

@Data
@TableName("role_permission")
public class RolePermission {
  @TableId
  private Long id;
  private Long tenantId;
  private UserRole role;
  private String permissionCode;
  private String permissionName;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private LocalDateTime deletedAt;

}
