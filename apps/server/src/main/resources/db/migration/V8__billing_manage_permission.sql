INSERT INTO role_permission (id, tenant_id, role, permission_code, permission_name, deleted_at)
VALUES
  (1000000000000001311, 1000000000000000001, 'TENANT_OWNER', 'billing:manage', '管理收款', NULL),
  (1000000000000001312, 1000000000000000001, 'PLATFORM_ADMIN', 'billing:manage', '管理收款', NULL)
ON DUPLICATE KEY UPDATE
  permission_name = VALUES(permission_name),
  deleted_at = NULL,
  updated_at = CURRENT_TIMESTAMP;
