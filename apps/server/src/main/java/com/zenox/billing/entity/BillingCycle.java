package com.zenox.billing.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zenox.common.entity.TenantScopedEntity;
import com.zenox.common.enums.BillingStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("billing_cycle")
public class BillingCycle extends TenantScopedEntity {
  private Long studentId;
  private LocalDate cycleMonth;
  private BigDecimal totalAmount;
  private BillingStatus status;
}
