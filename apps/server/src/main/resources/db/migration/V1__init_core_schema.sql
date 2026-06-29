CREATE TABLE tenant (
  id BIGINT PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  plan_code VARCHAR(32) NOT NULL,
  owner_name VARCHAR(64),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE user_account (
  id BIGINT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  username VARCHAR(64) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(64) NOT NULL,
  role VARCHAR(32) NOT NULL,
  status VARCHAR(32) NOT NULL,
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  UNIQUE KEY uk_user_account_username (username),
  KEY idx_user_account_tenant (tenant_id),
  CONSTRAINT fk_user_account_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE teacher_profile (
  id BIGINT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  display_name VARCHAR(64) NOT NULL,
  subject VARCHAR(64),
  phone VARCHAR(32),
  bio TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  KEY idx_teacher_profile_tenant (tenant_id),
  CONSTRAINT fk_teacher_profile_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
  CONSTRAINT fk_teacher_profile_user FOREIGN KEY (user_id) REFERENCES user_account(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE parent_profile (
  id BIGINT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  user_id BIGINT NULL,
  name VARCHAR(64) NOT NULL,
  phone VARCHAR(32),
  wechat_openid VARCHAR(128),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  KEY idx_parent_profile_tenant (tenant_id),
  CONSTRAINT fk_parent_profile_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
  CONSTRAINT fk_parent_profile_user FOREIGN KEY (user_id) REFERENCES user_account(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE student_profile (
  id BIGINT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  name VARCHAR(64) NOT NULL,
  grade VARCHAR(32),
  school VARCHAR(128),
  subject VARCHAR(64),
  parent_name VARCHAR(64),
  parent_phone VARCHAR(32),
  remaining_lessons INT NOT NULL DEFAULT 0,
  weakness_note TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  KEY idx_student_profile_tenant (tenant_id),
  CONSTRAINT fk_student_profile_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE class_group (
  id BIGINT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  name VARCHAR(128) NOT NULL,
  subject VARCHAR(64),
  grade VARCHAR(32),
  description TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  KEY idx_class_group_tenant (tenant_id),
  CONSTRAINT fk_class_group_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE class_member (
  id BIGINT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  class_group_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  UNIQUE KEY uk_class_member_student (class_group_id, student_id),
  KEY idx_class_member_tenant (tenant_id),
  CONSTRAINT fk_class_member_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
  CONSTRAINT fk_class_member_class FOREIGN KEY (class_group_id) REFERENCES class_group(id),
  CONSTRAINT fk_class_member_student FOREIGN KEY (student_id) REFERENCES student_profile(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE lesson (
  id BIGINT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  class_group_id BIGINT NULL,
  teacher_user_id BIGINT NOT NULL,
  subject VARCHAR(64),
  topic VARCHAR(255),
  starts_at DATETIME NOT NULL,
  ends_at DATETIME NOT NULL,
  lesson_hours DECIMAL(6,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  delivery_mode VARCHAR(32) NOT NULL DEFAULT 'ONLINE',
  status VARCHAR(32) NOT NULL DEFAULT 'SCHEDULED',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  KEY idx_lesson_tenant_time (tenant_id, starts_at, ends_at),
  KEY idx_lesson_teacher_time (teacher_user_id, starts_at, ends_at),
  CONSTRAINT fk_lesson_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
  CONSTRAINT fk_lesson_class FOREIGN KEY (class_group_id) REFERENCES class_group(id),
  CONSTRAINT fk_lesson_teacher FOREIGN KEY (teacher_user_id) REFERENCES user_account(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE lesson_attendance (
  id BIGINT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  lesson_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  status VARCHAR(32) NOT NULL,
  teacher_comment TEXT,
  parent_confirmed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  KEY idx_lesson_attendance_tenant (tenant_id),
  CONSTRAINT fk_lesson_attendance_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
  CONSTRAINT fk_lesson_attendance_lesson FOREIGN KEY (lesson_id) REFERENCES lesson(id),
  CONSTRAINT fk_lesson_attendance_student FOREIGN KEY (student_id) REFERENCES student_profile(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE homework (
  id BIGINT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  lesson_id BIGINT NULL,
  teacher_user_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  due_at DATETIME NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  KEY idx_homework_tenant (tenant_id),
  CONSTRAINT fk_homework_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
  CONSTRAINT fk_homework_lesson FOREIGN KEY (lesson_id) REFERENCES lesson(id),
  CONSTRAINT fk_homework_teacher FOREIGN KEY (teacher_user_id) REFERENCES user_account(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE homework_visibility (
  id BIGINT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  homework_id BIGINT NOT NULL,
  target_type VARCHAR(32) NOT NULL,
  target_id BIGINT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  KEY idx_homework_visibility_tenant (tenant_id),
  CONSTRAINT fk_homework_visibility_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
  CONSTRAINT fk_homework_visibility_homework FOREIGN KEY (homework_id) REFERENCES homework(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE homework_submission (
  id BIGINT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  homework_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  content TEXT,
  submitted_at DATETIME NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'SUBMITTED',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  KEY idx_homework_submission_tenant (tenant_id),
  CONSTRAINT fk_homework_submission_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
  CONSTRAINT fk_homework_submission_homework FOREIGN KEY (homework_id) REFERENCES homework(id),
  CONSTRAINT fk_homework_submission_student FOREIGN KEY (student_id) REFERENCES student_profile(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE homework_review (
  id BIGINT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  submission_id BIGINT NOT NULL,
  reviewer_user_id BIGINT NOT NULL,
  score DECIMAL(6,2) NULL,
  comment TEXT,
  mistake_tags VARCHAR(512),
  reviewed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  KEY idx_homework_review_tenant (tenant_id),
  CONSTRAINT fk_homework_review_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
  CONSTRAINT fk_homework_review_submission FOREIGN KEY (submission_id) REFERENCES homework_submission(id),
  CONSTRAINT fk_homework_review_reviewer FOREIGN KEY (reviewer_user_id) REFERENCES user_account(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE question (
  id BIGINT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  creator_user_id BIGINT NOT NULL,
  subject VARCHAR(64),
  grade VARCHAR(32),
  knowledge_point VARCHAR(128),
  difficulty VARCHAR(32),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  scope VARCHAR(32) NOT NULL DEFAULT 'PRIVATE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  KEY idx_question_tenant (tenant_id),
  CONSTRAINT fk_question_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
  CONSTRAINT fk_question_creator FOREIGN KEY (creator_user_id) REFERENCES user_account(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE question_interaction (
  id BIGINT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  question_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  interaction_type VARCHAR(32) NOT NULL,
  content TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  KEY idx_question_interaction_tenant (tenant_id),
  CONSTRAINT fk_question_interaction_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
  CONSTRAINT fk_question_interaction_question FOREIGN KEY (question_id) REFERENCES question(id),
  CONSTRAINT fk_question_interaction_user FOREIGN KEY (user_id) REFERENCES user_account(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE billing_cycle (
  id BIGINT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  cycle_month DATE NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  UNIQUE KEY uk_billing_cycle_student_month (student_id, cycle_month),
  KEY idx_billing_cycle_tenant (tenant_id),
  CONSTRAINT fk_billing_cycle_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
  CONSTRAINT fk_billing_cycle_student FOREIGN KEY (student_id) REFERENCES student_profile(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE billing_item (
  id BIGINT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  billing_cycle_id BIGINT NOT NULL,
  lesson_id BIGINT NULL,
  title VARCHAR(255) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  KEY idx_billing_item_tenant (tenant_id),
  CONSTRAINT fk_billing_item_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
  CONSTRAINT fk_billing_item_cycle FOREIGN KEY (billing_cycle_id) REFERENCES billing_cycle(id),
  CONSTRAINT fk_billing_item_lesson FOREIGN KEY (lesson_id) REFERENCES lesson(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE payment_record (
  id BIGINT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  billing_cycle_id BIGINT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  paid_at DATETIME NOT NULL,
  method VARCHAR(32),
  note VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  KEY idx_payment_record_tenant (tenant_id),
  CONSTRAINT fk_payment_record_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
  CONSTRAINT fk_payment_record_cycle FOREIGN KEY (billing_cycle_id) REFERENCES billing_cycle(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE notification_task (
  id BIGINT PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  target_user_id BIGINT NULL,
  channel VARCHAR(32) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  scheduled_at DATETIME NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  KEY idx_notification_task_tenant (tenant_id),
  CONSTRAINT fk_notification_task_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(id),
  CONSTRAINT fk_notification_task_target FOREIGN KEY (target_user_id) REFERENCES user_account(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
