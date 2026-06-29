package com.zenox.homework.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zenox.common.entity.TenantScopedEntity;
import com.zenox.common.enums.HomeworkStatus;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("homework")
public class Homework extends TenantScopedEntity {
  private Long lessonId;
  private Long teacherUserId;
  private String title;
  private String content;
  private LocalDateTime dueAt;
  private HomeworkStatus status;
}
