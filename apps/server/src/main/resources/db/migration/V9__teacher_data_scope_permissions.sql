UPDATE role_permission
SET deleted_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE tenant_id = 1000000000000000001
  AND role = 'TEACHER'
  AND permission_code = 'student:manage'
  AND deleted_at IS NULL;
