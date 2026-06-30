package com.zenox.user.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zenox.common.entity.TenantScopedEntity;
import java.math.BigDecimal;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("student_profile")
public class StudentProfile extends TenantScopedEntity {
  private String name;
  private String grade;
  private String school;
  private String subject;
  private String parentName;
  private String parentPhone;
  private BigDecimal remainingLessons;
  private String weaknessNote;
}
