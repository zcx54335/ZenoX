# ZenoX Server

Spring Boot 3 + Java 21 backend for the ZenoX tutor SaaS.

## Stack

- Java 21
- Spring Boot 3
- MySQL 8
- Flyway
- MyBatis Plus
- JWT auth skeleton
- Springdoc OpenAPI

## Local Run

1. Install JDK 21 and Maven.
2. Start MySQL:

```bash
cd apps/server
docker compose up -d
```

3. Run server:

```bash
mvn spring-boot:run
```

Default server URL:

```text
http://127.0.0.1:8080
```

OpenAPI:

```text
http://127.0.0.1:8080/swagger-ui.html
```

## Demo Login

After Flyway seed migration:

```json
{
  "username": "zcx",
  "password": "123456"
}
```

Response format:

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "user": {
      "id": 1000000000000000101,
      "tenantId": 1000000000000000001,
      "username": "zcx",
      "displayName": "赵辰雄",
      "role": "TENANT_OWNER"
    }
  }
}
```

## First Backend Milestone

This scaffold intentionally stops at architecture, schema, and auth skeleton. The next safe step is to implement focused CRUD for:

1. Students
2. Classes
3. Lessons with conflict checks
