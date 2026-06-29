package com.zenox.lesson.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zenox.common.entity.TenantScopedEntity;
import com.zenox.common.enums.LessonStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("lesson")
public class Lesson extends TenantScopedEntity {
  private Long classGroupId;
  private Long teacherUserId;
  private String subject;
  private String topic;
  private LocalDateTime startsAt;
  private LocalDateTime endsAt;
  private BigDecimal lessonHours;
  private BigDecimal unitPrice;
  private String deliveryMode;
  private LessonStatus status;
}
