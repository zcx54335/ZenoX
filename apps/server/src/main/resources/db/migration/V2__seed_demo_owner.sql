INSERT INTO tenant (id, name, plan_code, owner_name)
VALUES (1000000000000000001, 'ZenoX Studio', 'STUDIO', '赵辰雄');

INSERT INTO user_account (
  id,
  tenant_id,
  username,
  password_hash,
  display_name,
  role,
  status
) VALUES (
  1000000000000000101,
  1000000000000000001,
  'zcx',
  '{noop}123456',
  '赵辰雄',
  'TENANT_OWNER',
  'ACTIVE'
);

INSERT INTO teacher_profile (
  id,
  tenant_id,
  user_id,
  display_name,
  subject,
  phone,
  bio
) VALUES (
  1000000000000000201,
  1000000000000000001,
  1000000000000000101,
  '赵辰雄',
  '数学',
  NULL,
  'ZenoX demo tenant owner'
);
