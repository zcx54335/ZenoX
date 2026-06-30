ALTER TABLE homework_review
  ADD COLUMN needs_correction TINYINT(1) NOT NULL DEFAULT 0 AFTER mistake_tags,
  ADD COLUMN excellent TINYINT(1) NOT NULL DEFAULT 0 AFTER needs_correction;

ALTER TABLE homework_visibility
  ADD UNIQUE KEY uk_homework_visibility_target (homework_id, target_type, target_id, deleted_at);
