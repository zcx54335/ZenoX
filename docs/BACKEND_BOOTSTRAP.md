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

Flyway seeds one tenant owner:

```json
{
  "username": "zcx",
  "password": "123456"
}
```

Endpoint:

```text
POST /api/auth/login
```

## Next Recommended Step

Implement real CRUD in this order:

1. `student_profile`
2. `class_group` and `class_member`
3. `lesson` with teacher/student conflict checks
4. `homework` publish and visibility
