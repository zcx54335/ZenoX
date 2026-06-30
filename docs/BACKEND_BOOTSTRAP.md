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

Install JDK 21, Maven, Node.js 20+, and MySQL 8 first.

```bash
cd apps/server
mvn spring-boot:run
```

Health check:

```text
GET http://127.0.0.1:8081/api/health
```

Swagger UI:

```text
http://127.0.0.1:8081/swagger-ui.html
```

Default database connection in `apps/server/src/main/resources/application.yml`:

```text
host: 127.0.0.1
port: 3306
database: zenox
username: zenox
password: zenox_dev_password
```

If another computer uses different MySQL settings, set environment variables before starting the backend:

```bash
export ZENOX_DB_HOST=127.0.0.1
export ZENOX_DB_PORT=3306
export ZENOX_DB_NAME=zenox
export ZENOX_DB_USERNAME=zenox
export ZENOX_DB_PASSWORD=zenox_dev_password
```

On Windows PowerShell:

```powershell
$env:ZENOX_DB_HOST="127.0.0.1"
$env:ZENOX_DB_PORT="3306"
$env:ZENOX_DB_NAME="zenox"
$env:ZENOX_DB_USERNAME="zenox"
$env:ZENOX_DB_PASSWORD="zenox_dev_password"
```

Frontend startup:

```bash
npm install
npm run dev
```

Frontend URL:

```text
http://127.0.0.1:5173
```

Important local rule from the owner:

- Before starting the project, stop old services on `8081` and `5173`.
- Do not keep multiple Vite/frontend ports alive.
- On macOS, use `lsof -nP -iTCP:8081 -sTCP:LISTEN` and `lsof -nP -iTCP:5173 -sTCP:LISTEN` to find old services.
- On Windows, use `netstat -ano | findstr :8081` and `netstat -ano | findstr :5173`, then `taskkill /PID <pid> /F`.

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
PATCH /api/lessons/{id}/complete
PATCH /api/lessons/{id}/undo-complete
```

Homework:

```text
GET  /api/homework
POST /api/homework
```

Billing:

```text
GET    /api/billing
GET    /api/billing/{cycleId}
POST   /api/billing/{cycleId}/payments
DELETE /api/billing/payments/{paymentId}
GET    /api/billing/{cycleId}/statement.pdf
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

1. Add backend method-level permission checks for lesson/student/homework/billing endpoints.
2. Implement homework publish visibility, submission, attachments, and review.
3. Move the large frontend `App.tsx` into feature components.
4. Add operation logs for payment undo and lesson undo-complete.
5. Improve branded PDF template with configurable tenant logo/colors when SaaS customization starts.
