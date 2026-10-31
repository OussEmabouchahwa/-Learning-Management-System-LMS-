# Dars

Dars is a learning management system for managing courses, students and assessments. Instructors build courses and grade work. Students follow lessons, take timed quizzes, hand in assignments and track their progress. Admins manage the platform.

The name comes from the Arabic word for "lesson".

## Features

**Students**
- Dashboard built around one question: what should I do next? Resume point, due soon, grades, course list
- Lesson viewer with Markdown, code blocks and video, explicit "Mark as complete"
- Timed quizzes with autosave, attempt limits and instant results
- Assignment hand-in with file or text, late policy, grade and feedback
- Progress per lesson and per course, shown as a Lesson Trail

**Instructors**
- Course builder: modules, lessons, quizzes and assignments, drag and keyboard reordering, publish checklist
- Question bank with single choice, multiple choice and true or false
- Submission review and grading with feedback
- Gradebook and per-course progress summary

**Admins**
- User and role management, platform overview, audit log

**Platform**
- JWT access tokens with rotating refresh cookies, role-based and ownership-based authorization
- Docker-based deployment with automatic HTTPS, health checks, structured logs

## Tech stack

| Layer | Technology |
|---|---|
| Web | React 18, TypeScript, Vite, React Router, TanStack Query, Tailwind CSS 3.4, Radix UI, React Hook Form, Zod |
| API | Node.js 20, NestJS, TypeScript, Zod (nestjs-zod), Swagger/OpenAPI, Pino, argon2, Helmet |
| Data | PostgreSQL 16, Prisma |
| Shared | `packages/contracts`: Zod schemas and types used by web and API |
| Tests | Jest and Supertest (API), Vitest and Testing Library (web), Playwright (end to end) |
| Delivery | Docker, Docker Compose, Caddy, GitHub Actions |

## Documentation

| Document | Contents |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Modular monolith, diagrams, data model, auth flow, RBAC, ADRs, scalability |
| [docs/SECURITY.md](docs/SECURITY.md) | Threat model, controls, OWASP mapping, required security tests |
| [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) | 60/30/10 color system, typography, components, motion |
| [docs/design-reference.html](docs/design-reference.html) | Visual reference. Open in a browser |

## Getting started

Requirements: Node.js 20+, Docker.

```bash
npm install
cp apps/api/.env.example apps/api/.env
docker compose up -d db mailpit      # PostgreSQL and a local mail catcher
npm run db:migrate
npm run db:seed                      # demo data and accounts
npm run dev                          # web on :5173, API on :4000, docs on :4000/api/docs
```

Mail sent in development is visible at http://localhost:8025.

Demo accounts (development seed only, never created in production):

| Role | Email | Password |
|---|---|---|
| Admin | `admin@dars.test` | `DarsDemo-2026` |
| Instructor | `instructor@dars.test` | `DarsDemo-2026` |
| Student | `student@dars.test` | `DarsDemo-2026` |

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Web and API with hot reload |
| `npm run build` | Production build of every workspace |
| `npm run lint` | ESLint, zero warnings allowed |
| `npm run typecheck` | `tsc --noEmit` everywhere |
| `npm run format` | Prettier |
| `npm run test` | Unit and integration tests |
| `npm run test:e2e` | Playwright |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run db:seed` | Seed demo data |
| `npm run perf:load` | k6 load test against a running API |

## Configuration (`apps/api/.env`)

| Variable | Purpose |
|---|---|
| `NODE_ENV` | `development`, `test`, `production` |
| `PORT` | API port, default `4000` |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Signing secret for access tokens (32+ random bytes) |
| `JWT_ACCESS_TTL` | Default `15m` |
| `REFRESH_TTL_DAYS` | Default `7` |
| `CORS_ORIGINS` | Comma-separated allowed origins |
| `COOKIE_DOMAIN` | Cookie domain in production |
| `STORAGE_DRIVER` | `local` or `s3` |
| `STORAGE_LOCAL_PATH` | Upload directory for the `local` driver |
| `SMTP_URL` | Mail transport |
| `APP_URL` | Public web URL, used in emails |

The API refuses to start when a required variable is missing or invalid.

## Roles

| Role | Can |
|---|---|
| Student | Enroll, learn, take quizzes, hand in assignments, see own progress and grades |
| Instructor | Everything on their own courses: build, publish, grade, see gradebook |
| Admin | Everything, plus users, roles and the audit log |

The full permission matrix is in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#7-authorization).

## API

Base path `/api/v1`. Interactive documentation at `/api/docs` in development. The endpoint catalog is in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#9-api-conventions).

Errors always look like this:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Check the highlighted fields.", "fields": { "email": "Enter a valid email address." }, "requestId": "7f3c..." } }
```

## Testing

- API: unit tests for services and policies, integration tests with Supertest against a real PostgreSQL test database, and the security tests listed in [docs/SECURITY.md](docs/SECURITY.md#10-required-security-tests).
- Web: component tests by role and accessible name.
- End to end: one Playwright path per role (student learns and submits, instructor builds and grades, admin manages users).

## Deployment

Production runs as Docker containers: `web` (Nginx serving the built SPA), `api`, `db` (PostgreSQL) behind Caddy, which provides automatic HTTPS.

```bash
cp deploy/.env.production.example deploy/.env.production   # fill in real secrets
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env.production up -d --build
docker compose -f deploy/docker-compose.prod.yml exec api npx prisma migrate deploy
```

- GitHub Actions runs lint, typecheck and tests on every pull request, builds and pushes images on tags, and deploys over SSH.
- Health: `GET /health` (liveness) and `GET /ready` (database reachable).
- Backups: a nightly `pg_dump` job writes to a separate volume. Restore steps are documented in `deploy/RESTORE.md`.
- A managed alternative (static web on Netlify or Vercel, API on Render or Fly.io, database on Neon) works unchanged because configuration is environment-only.

## Performance

Budgets: Lighthouse performance 90+ on the dashboard, LCP under 2.5s, initial JavaScript under 180KB gzipped, API p95 under 200ms for list endpoints with the seed data. `npm run perf:load` runs the k6 scenario and fails when a budget is missed.

## Project structure

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#14-repository-structure).

## Contributing

Conventional Commits. Before a pull request: `npm run lint && npm run typecheck && npm run test`. Architectural changes need an ADR row in `docs/ARCHITECTURE.md`.
