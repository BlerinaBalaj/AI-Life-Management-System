# Requirement Coverage Audit

This document maps every mandatory distributed-systems requirement to the real implementation in this repository.

## Summary

- Backend: Spring Boot REST API in `backend/`
- Frontend: React + Context API client in `frontend/`
- Database: PostgreSQL schema managed by Flyway
- API documentation: Swagger UI at `http://localhost:8080/swagger-ui.html`
- Verification: `mvn test` and `npm run build`

## Requirements

| # | Requirement | Status | Evidence |
|---|-------------|--------|----------|
| 1 | Client-server architecture | Implemented | Separate `backend/` and `frontend/`; frontend calls backend only through Axios REST API in `frontend/src/api/client.js`. |
| 2 | HTTP/HTTPS REST communication | Implemented | Spring controllers expose `/api/**`; frontend uses HTTP base URL `http://localhost:8080/api`. |
| 3 | Minimum 20 endpoints | Implemented | 50+ mapped endpoints across auth, users, admin, goals, tasks, AI, search, fitness, nutrition, mood, progress and notifications. |
| 4 | RESTful API and framework | Implemented | Spring Boot in `backend/pom.xml`; controllers use `GET`, `POST`, `PUT`, `DELETE`. |
| 5 | OOP programming | Implemented | Entity, repository, service, controller, config and security classes are separated by responsibility. |
| 6 | Swagger documentation | Implemented | `springdoc-openapi-ui` dependency, `OpenApiConfig`, and `@Operation` annotations on controllers. |
| 7 | ORM and database | Implemented | Spring Data JPA/Hibernate repositories with PostgreSQL configuration in `application.yml`. |
| 8 | Authentication and authorization | Implemented | `AuthController`, `AuthService`, JWT provider/filter, USER/ADMIN roles, admin endpoints restricted in `SecurityConfig`. |
| 9 | Middleware | Implemented | `RequestLoggingFilter`, `JwtAuthenticationFilter`, and `GlobalExceptionHandler`. |
| 10 | Frontend React + Context | Implemented | React pages in `frontend/src/pages`; authentication state in `frontend/src/context/AuthContext.jsx`. |
| 11 | Testing + CI/CD | Implemented | JUnit/MockMvc tests in `backend/src/test`; GitHub Actions pipeline in `.github/workflows/ci.yml`. |
| 12 | Minimum 20 models and migrations | Implemented | 26 JPA entities and 26 `CREATE TABLE` statements in `V1__initial_schema.sql`. |
| 13 | Project documentation | Implemented | `README.md`, `docs/architecture.md`, `docs/api-endpoints.md`, `docs/database-schema.md`, this audit document. |
| 14 | Project management | Implemented | GitHub Projects/Jira-ready breakdown in `docs/project-management/task-breakdown.md`. |
| 15 | Git and collaboration | Implemented | `.github/pull_request_template.md`, CI workflow, and `docs/git-collaboration.md`. |
| 16 | LLM integration | Implemented | `LlamaAiClient`, `AiService`, `/api/ai/chat`, `/api/ai/analyze-text`, daily plan, workout, nutrition, mood and weekly report endpoints. |
| 17 | Caching | Implemented | Spring Cache with Redis configuration in `CacheConfig`; Redis service in `docker-compose.yml`; AI responses cached when an API key is configured. |
| 18 | Async/background jobs | Implemented | `@EnableAsync`, `@EnableScheduling`, `AiBackgroundJob`, async weekly report generation and queued email notification service. |
| 19 | Multi-tenancy | Implemented | `Tenant`, `TenantScopedEntity`, JWT tenant id, `CurrentUserService`, and tenant-aware repository queries. |
| 20 | Search/filtering | Implemented | `/api/search/tasks`, `/api/search/workouts`, `/api/search/nutrition`, `/api/search/mood-logs`, `/api/search/ai-reports`; also filters on resource endpoints. |

## Added Verification Test

`RequirementApiTests` verifies these requirements together:

- JWT-protected requests
- USER cannot access ADMIN endpoints
- tenant isolation between two registered users
- task search and filtering by query/status

This makes the audit stronger because it proves the behavior through real API calls, not only by reading code.
