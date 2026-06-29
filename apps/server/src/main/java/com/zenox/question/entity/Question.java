package com.zenox.question.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zenox.common.entity.TenantScopedEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("question")
public class Question extends TenantScopedEntity {
  private Long creatorUserId;
  private String subject;
  private String grade;
  private String knowledgePoint;
  private String difficulty;
  private String title;
  private String content;
  private String scope;
}
