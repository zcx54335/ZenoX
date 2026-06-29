package com.zenox.common.entity;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public abstract class TenantScopedEntity {
  private Long id;
  private Long tenantId;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private LocalDateTime deletedAt;
}
