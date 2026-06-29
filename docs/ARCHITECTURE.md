# 微拟课管家技术架构

## 总体方案

采用前后端分离：

- Web 管理端：React + TypeScript + Vite。
- 微信小程序端：原生小程序页面，优先服务学生和家长。
- 后端：Java 21 + Spring Boot 3。
- 数据库：MySQL 8。
- 缓存与任务：Redis。
- 文件：对象存储，保存作业图片、讲义、PDF、视频。
- 通知：微信小程序订阅消息，后续可加短信。

## 后端建议模块

建议后端先做单体模块化，别一开始上微服务。你的第一版业务还在验证期，模块清晰比部署复杂更重要。

```text
weini-server
  ├─ auth              登录、微信授权、Token、角色权限
  ├─ tenant            老师租户、套餐、品牌主页
  ├─ user              老师、助教、学生、家长
  ├─ class             班级、小组、学生入班
  ├─ lesson            排课、调课、请假、补课、签到
  ├─ homework          作业、提交、批改、可见范围
  ├─ question-bank     题库、题型、收藏、评论
  ├─ billing           课时、账单、收款、家长确认
  ├─ notification      订阅消息、提醒任务
  └─ report            学习报告、收入报表、续费风险
```

## 核心表设计

| 表 | 说明 |
| --- | --- |
| tenant | 老师或工作室租户 |
| tenant_plan | 套餐与权限 |
| user_account | 统一账号 |
| teacher_profile | 老师档案 |
| student_profile | 学生档案 |
| parent_profile | 家长档案 |
| class_group | 班级 |
| class_member | 班级成员 |
| lesson | 课程安排 |
| lesson_attendance | 上课记录、签到、请假 |
| homework | 作业 |
| homework_visibility | 作业可见范围 |
| homework_submission | 作业提交 |
| homework_review | 批改与反馈 |
| question | 题库题目 |
| question_interaction | 收藏、点赞、评论 |
| billing_cycle | 月度账期 |
| billing_item | 账单明细 |
| payment_record | 收款记录 |
| notification_task | 通知任务 |

## 多租户策略

第一版推荐 `tenant_id` 字段隔离：

- 所有业务表都带 `tenant_id`。
- 登录后从 Token 中解析当前租户。
- 后端统一拦截器或 MyBatis Plus 插件自动加租户条件。
- 未来大型客户再考虑独立数据库。

## 权限模型

| 角色 | 主要权限 |
| --- | --- |
| TENANT_OWNER | 老师本人或工作室负责人，拥有全部权限 |
| TEACHER | 管理被分配学生、课程、作业 |
| ASSISTANT | 批改作业、维护资料、查看授权课程 |
| STUDENT | 查看自己的课程、作业、反馈、错题 |
| PARENT | 查看孩子课程、作业状态、确认账单 |
| PLATFORM_ADMIN | 管理 SaaS 套餐、租户、运营数据 |

## API 风格

建议用 REST 起步：

```text
POST   /api/auth/wechat-login
GET    /api/dashboard/teacher
POST   /api/lessons
PUT    /api/lessons/{id}/reschedule
POST   /api/homework
POST   /api/homework/{id}/submissions
POST   /api/homework/submissions/{id}/review
GET    /api/questions
POST   /api/questions
POST   /api/billing/cycles/{id}/confirm
```

## 第一版开发顺序

1. 账号、租户、角色权限。
2. 学生、家长、班级。
3. 排课与调课。
4. 作业发布、提交、批改。
5. 上课记录与家长确认。
6. 课时账单。
7. 题库社区。
8. SaaS 套餐和老师品牌主页。

## 前端工程

当前仓库已拆出：

```text
apps/web           React Web 管理端
apps/miniprogram   微信小程序端
docs               架构和产品文档
```

Web 端适合老师电脑管理，小程序端适合学生和家长。后续可继续抽一个 `packages/shared` 放接口类型、枚举、权限常量。
