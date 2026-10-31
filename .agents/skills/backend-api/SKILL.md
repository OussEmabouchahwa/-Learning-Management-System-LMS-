---
name: backend-api
description: Builds the NestJS, Prisma and PostgreSQL REST API for the Dars LMS as a modular monolith with Zod contracts, services, repositories, policies, events, pagination and error handling. Use when creating or changing modules, endpoints, migrations, seed data or server-side business rules.
---

# Backend API

## Goal

Produce a typed, layered, secure API that matches `docs/ARCHITECTURE.md` and passes review without comments.

## Module template

```
modules/<name>/
  <name>.module.ts
  <name>.controller.ts      HTTP only
  <name>.service.ts         use cases, transactions, events
  <name>.repository.ts      Prisma access only
  <name>.policy.ts          pure authorization functions
  <name>.events.ts          event names and payload types
  index.ts                  public surface for other modules
  *.spec.ts                 unit tests; *.e2e-spec.ts for HTTP
```

## Instructions

1. **Contracts first.** Define schemas in `packages/contracts` and use them for DTOs (`nestjs-zod`). Strict objects, trimmed strings, lowercase emails, coerced query numbers.
2. **Controllers** read validated input, call one service method, return `{ data, meta? }`. Decorate with Swagger metadata and roles.
3. **Services** hold rules and transactions. They throw `AppError(code, status, message, fields?)`. They emit events after commit.
4. **Repositories** return plain objects, never leak Prisma types to controllers, use explicit `select`.
5. **Global pieces:** exception filter producing the standard error shape with `requestId`, response interceptor, request-id middleware, pino logger, validation pipe, graceful shutdown hooks.
6. **Pagination and filters:** `page` and `limit` (default 20, maximum 100), sort by allow-list, filters validated. Return `meta: { page, limit, total, totalPages }`.
7. **Events:** `@nestjs/event-emitter`. `progress` subscribes to `lesson.completed`, `quiz.graded`, `submission.graded`, `enrollment.created` and updates `Enrollment.progressPct` and `completedAt`.
8. **Dashboard endpoint** `GET /me/dashboard` assembles resume target, due-soon items, stats and course list in a small, fixed number of queries.
9. **Seed** (`prisma/seed.ts`, development only, idempotent): 3 users (one per role), 4 courses with modules and lessons in Markdown, 2 quizzes with 8 questions, 3 assignments with due dates relative to today, enrollments, partial progress, and a few graded submissions. Realistic and diverse names and titles.
10. **Docs:** every endpoint appears in OpenAPI with request, response and error examples.

## Constraints

- No business logic in controllers or repositories.
- No cross-module repository imports.
- No `any`. No unvalidated input. No unbounded list queries.
