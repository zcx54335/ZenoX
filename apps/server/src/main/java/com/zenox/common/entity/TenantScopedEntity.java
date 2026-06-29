package com.zenox.common.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public abstract class TenantScopedEntity {
  @TableId
  private Long id;
  @TableField("tenant_id")
  private Long tenantId;
  @TableField("created_at")
  private LocalDateTime createdAt;
  @TableField("updated_at")
  private LocalDateTime updatedAt;
  @TableField("deleted_at")
  private LocalDateTime deletedAt;
}
