package com.zenox.notification.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zenox.common.entity.TenantScopedEntity;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("notification_task")
public class NotificationTask extends TenantScopedEntity {
  private Long targetUserId;
  private String channel;
  private String title;
  private String content;
  private LocalDateTime scheduledAt;
  private String status;
}
