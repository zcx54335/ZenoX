package com.zenox.tenant.entity;

import com.zenox.common.enums.TenantPlanCode;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class Tenant {
  private Long id;
  private String name;
  private TenantPlanCode planCode;
  private String ownerName;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private LocalDateTime deletedAt;
}
