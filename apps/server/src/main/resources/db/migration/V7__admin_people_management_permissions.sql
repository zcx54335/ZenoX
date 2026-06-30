INSERT INTO role_permission (id, tenant_id, role, permission_code, permission_name, deleted_at)
VALUES
  (1000000000000001301, 1000000000000000001, 'TENANT_OWNER', 'teacher:manage', '管理老师', NULL),
  (1000000000000001302, 1000000000000000001, 'PLATFORM_ADMIN', 'teacher:manage', '管理老师', NULL),
  (1000000000000001303, 1000000000000000001, 'PLATFORM_ADMIN', 'student:manage', '管理学员', NULL)
ON DUPLICATE KEY UPDATE
  permission_name = VALUES(permission_name),
  deleted_at = NULL,
  updated_at = CURRENT_TIMESTAMP;
