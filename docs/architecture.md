# System Architecture

## Client-Server Boundary

The system is split into two independent applications:

- `frontend`: React application. It never connects to the database.
- `backend`: Spring Boot REST API. It owns persistence, authentication, authorization, AI calls, caching, and background jobs.

Communication happens only through HTTP REST endpoints under `/api`.

## Backend Layers

```text
Controller -> Service -> Repository -> Database
```

- Controllers expose REST endpoints and Swagger metadata.
- Services contain business rules, tenant checks, AI orchestration, and transaction boundaries.
- Repositories are Spring Data JPA interfaces.
- Entities represent normalized relational tables.

## Multi-Tenancy

Each user belongs to a `Tenant`. Every user-owned table includes `tenant_id`, and services query data by the authenticated user's `tenantId`.

JWT tokens contain:

```text
user id
tenant id
email
role
```

The JWT filter sets authentication and tenant context for each request.

Tenant isolation is enforced in four places:

- Registration creates or resolves a tenant from `tenantName`; the first user in a tenant becomes `ADMIN`, later users become `USER`.
- JWT tokens include `tenantId`; `JwtAuthenticationFilter` loads the user and stores the tenant id in `TenantContext` for the current request.
- Repositories and services use tenant-aware queries such as `findByUserIdAndTenantId(...)` and `findByIdAndUserIdAndTenantId(...)`.
- Admin endpoints are tenant-scoped: `ADMIN` can manage only users in their own tenant, while `SUPER_ADMIN` can manage users across all tenants.

This means tenant A cannot list, update, search, or delete tenant B data through normal API flows. The regression test `RequirementApiTests.jwtRbacTenantIsolationAndSearchFilteringWorkTogether` verifies that tenant B cannot see tenant A tasks and that admin user listing stays inside the authenticated tenant.

## AI Module

The frontend calls only the backend. The backend calls a Llama-compatible chat-completions endpoint:

```text
React -> Spring Boot /api/ai/* -> Llama chat-completions API
```

AI input is structured with user goals, tasks, fitness history, nutrition history, mood logs, stress logs, and progress metrics. AI output is requested as structured JSON.

Endpoints include chatbot, text analysis, daily plan generation, workout suggestion, nutrition suggestion, mood analysis, and weekly report generation.

## Caching

AI responses are cached with Spring Cache. In production, set:

```text
CACHE_TYPE=redis
```

## Background Jobs

`AiBackgroundJob` schedules weekly AI reports. `AiService.generateWeeklyReportAsync` runs heavy AI work asynchronously.
