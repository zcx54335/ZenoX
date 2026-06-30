package com.zenox.question.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zenox.common.security.DataScope;
import com.zenox.question.entity.Question;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface QuestionMapper extends BaseMapper<Question> {
  @Select("""
      SELECT COUNT(1)
      FROM question q
      WHERE q.id = #{questionId}
        AND q.tenant_id = #{scope.tenantId}
        AND q.deleted_at IS NULL
        AND (
          #{scope.admin} = TRUE
          OR q.creator_user_id = #{scope.userId}
          OR q.scope = 'PUBLIC'
        )
      """)
  int countVisibleQuestion(@Param("scope") DataScope scope, @Param("questionId") Long questionId);

  @Select("""
      SELECT id
      FROM question_interaction
      WHERE tenant_id = #{tenantId}
        AND question_id = #{questionId}
        AND user_id = #{userId}
        AND interaction_type = #{interactionType}
        AND deleted_at IS NULL
      LIMIT 1
      """)
  Long findActiveInteractionId(
      @Param("tenantId") Long tenantId,
      @Param("questionId") Long questionId,
      @Param("userId") Long userId,
      @Param("interactionType") String interactionType
  );

  @Insert("""
      INSERT INTO question_interaction (
        id,
        tenant_id,
        question_id,
        user_id,
        interaction_type,
        content
      )
      VALUES (
        #{id},
        #{tenantId},
        #{questionId},
        #{userId},
        #{interactionType},
        #{content}
      )
      """)
  void insertInteraction(
      @Param("id") Long id,
      @Param("tenantId") Long tenantId,
      @Param("questionId") Long questionId,
      @Param("userId") Long userId,
      @Param("interactionType") String interactionType,
      @Param("content") String content
  );

  @Update("""
      UPDATE question_interaction
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = #{id}
        AND tenant_id = #{tenantId}
      """)
  void softDeleteInteraction(@Param("tenantId") Long tenantId, @Param("id") Long id);

  @Insert("""
      INSERT INTO file_attachment (
        id,
        tenant_id,
        owner_type,
        owner_id,
        uploader_user_id,
        original_name,
        storage_path,
        content_type,
        file_size
      )
      VALUES (
        #{id},
        #{tenantId},
        'QUESTION',
        #{questionId},
        #{uploaderUserId},
        #{originalName},
        #{storagePath},
        #{contentType},
        #{fileSize}
      )
      """)
  void insertQuestionAttachment(
      @Param("id") Long id,
      @Param("tenantId") Long tenantId,
      @Param("questionId") Long questionId,
      @Param("uploaderUserId") Long uploaderUserId,
      @Param("originalName") String originalName,
      @Param("storagePath") String storagePath,
      @Param("contentType") String contentType,
      @Param("fileSize") Long fileSize
  );
}
