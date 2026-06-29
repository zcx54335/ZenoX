# ZenoX Backend Bootstrap

## Current Backend Scaffold

Path:

```text
apps/server
```

Stack:

- Java 21
- Spring Boot 3
- Maven
- MySQL 8
- Flyway
- MyBatis Plus
- JWT auth skeleton
- Springdoc OpenAPI
- Apache POI Excel export

## Package Layout

```text
com.zenox
  auth              login, JWT, security config
  tenant            tenant and plan base model
  user              account and student profile model
  classroom         class/group model
  lesson            scheduling model
  homework          homework model
  question          question bank model
  billing           billing cycle model
  notification      reminder task model
  common            response, errors, enums, tenant context, config
```

## Local Startup

Install JDK 21 and Maven first.

```bash
cd apps/server
docker compose up -d
mvn spring-boot:run
```

Health check:

```text
GET http://127.0.0.1:8080/api/health
```

Swagger UI:

```text
http://127.0.0.1:8080/swagger-ui.html
```

## Demo Login

Flyway seeds one tenant owner and demo users:

```text
zcx / 123456       TENANT_OWNER, admin, all permissions
teacher / 123456   TEACHER, teaching and operations permissions
student / 123456   STUDENT, homework/question/record visibility only
parent / 123456    PARENT, homework feedback, records, billing visibility
```

Endpoint:

```text
POST /api/auth/login
```

Login response includes:

- `accessToken`
- `refreshToken`
- `accessCodes`
- `user`

Frontend navigation must use `accessCodes`; users must not choose their own role in the login UI.

## Implemented APIs

Auth:

```text
POST /api/auth/login
POST /api/auth/wechat-login
```

Students:

```text
GET  /api/students
POST /api/students
```

Classes:

```text
GET  /api/classes
POST /api/classes
```

Lessons / schedule:

```text
GET   /api/lessons
POST  /api/lessons
PUT   /api/lessons/{id}/reschedule
PATCH /api/lessons/{id}/cancel
GET   /api/lessons/export?month=YYYY-MM
```

Homework:

```text
GET  /api/homework
POST /api/homework
```

## Schedule Rules

The first real schedule version supports:

- selected-day lesson list in the web UI.
- lesson creation from the web UI.
- quick delay by 30 minutes.
- cancel lesson.
- monthly Excel export.

Backend conflict checks:

- same teacher cannot have overlapping lessons.
- same class/group cannot have overlapping lessons.
- same student cannot be scheduled through another class/group at the same time.

Excel export:

- `GET /api/lessons/export?month=2026-06`
- returns `.xlsx`
- frontend downloads as `ZenoX-课程记录-YYYY-MM.xlsx`
- columns: date, start, end, class/group, student count, subject, topic, hours, unit price, amount, delivery mode, status.

## Current Permissions

Permissions are stored in `role_permission`.

Current intent:

- `TENANT_OWNER`: all current permissions.
- `TEACHER`: dashboard, schedule, class/student roster, homework, review, question bank, records, reminders, billing view.
- `STUDENT`: no dashboard, no schedule, no class roster. Can view/submit homework, view review, question bank, records.
- `PARENT`: no dashboard, no schedule, no class roster. Can view homework feedback, records, billing/monthly export.

## Next Recommended Step

Recommended next backend steps:

1. Add backend method-level permission checks for lesson/student/homework endpoints.
2. Implement class member management APIs and UI.
3. Replace remaining frontend mock modules with backend data.
4. Implement homework publish visibility, submission, and review.
5. Generate billing cycles from completed lessons.
