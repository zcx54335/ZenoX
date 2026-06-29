package com.zenox.classroom.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zenox.common.entity.TenantScopedEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("class_group")
public class ClassGroup extends TenantScopedEntity {
  private String name;
  private String subject;
  private String grade;
  private String description;
}
