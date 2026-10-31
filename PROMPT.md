# Master prompt for Antigravity: Dars LMS

How to use: put `.agents/`, `docs/` and `README.md` from this kit into an empty project folder, open it in Antigravity, choose **Planning** mode, and paste everything under the line below into the agent chat.

---

You are a senior full-stack engineer, system architect and product designer working as one team. Build **Dars**, a production-quality **Learning Management System**, in this workspace. It must read like the work of an experienced team: a deliberate architecture, secure authentication, strict typing, meaningful tests, accurate documentation, a deployable setup, and a distinctive, polished interface. It must not look like a tutorial project or a generic AI-generated admin template.

## 0. Before writing any code

1. Read, in this order: `.agents/rules/*`, `docs/ARCHITECTURE.md`, `docs/SECURITY.md`, `docs/DESIGN_SYSTEM.md`, open and study `docs/design-reference.html`, `README.md`, then every skill in `.agents/skills/`. They are binding. The README and documents describe the target structure, scripts, API and design, and the finished project must match them.
2. Produce an implementation plan (Plan artifact): module list, data model, API contract, component tree, and the phases below with their checks. Then proceed without waiting unless a decision is genuinely ambiguous. If you must deviate from a document, record it as an ADR row and say why.

## 1. Product

Dars lets instructors build and run courses and lets students learn and be assessed. Roles: **Student**, **Instructor**, **Admin** (permission matrix in the architecture document).

The four key features, each fully working end to end:

1. **Course management:** create, edit, publish and archive courses with modules and lessons (Markdown, video embed), ordering by drag and by keyboard.
2. **Student dashboard:** resume point, due soon, grades and course list from one aggregated call.
3. **Assignments and quizzes:** timed quizzes with server-authoritative timing and auto-grading, assignments with file or text hand-in, late policy, instructor grading with feedback.
4. **Progress tracking:** lesson completion, course progress percentage, gradebook for instructors and grades for students.

## 2. Stack (fixed, do not substitute)

- Monorepo with npm workspaces: `apps/web`, `apps/api`, `packages/contracts`.
- Web: React 18, TypeScript, Vite, React Router, TanStack Query, Tailwind CSS 3.4, Radix UI, React Hook Form, Zod, lucide-react, react-markdown with rehype-sanitize, dnd-kit.
- API: Node 20+, NestJS, TypeScript, Prisma, PostgreSQL 16, nestjs-zod, @nestjs/swagger, @nestjs/throttler, @nestjs/event-emitter, nestjs-pino, argon2, helmet.
- Tests: Jest and Supertest (API), Vitest and Testing Library (web), Playwright with axe (end to end), k6 (load).
- Delivery: Docker, Docker Compose, Caddy, GitHub Actions.

## 3. Phases (these follow the five workflow steps of the task)

After each phase: run its checks, fix failures, update docs, commit with a Conventional Commit.

### Step 1: Design the course and student modules

- **Phase 1, scaffold and foundations:** workspaces, TypeScript configs, ESLint, Prettier, boundary lint, `packages/contracts`, environment validation, structured logging, global error filter, request ids, docker compose for `db` and `mailpit`. Check: `lint` and `typecheck` pass, API boots, `/health` works.
- **Phase 2, data model:** Prisma schema for every entity in the ERD, constraints and indexes from the architecture document, first migration, seed script (development only, idempotent, realistic and diverse data, dates relative to today). Check: migrate and seed succeed on an empty database.

### Step 2: Implement authentication and authorization

- **Phase 3, auth and security:** follow the `auth-security` skill. Register, login, refresh rotation with reuse detection, logout, verify email, forgot and reset password, `/auth/me`, JWT guard, roles guard, ownership policies, rate limiting, helmet and CSP, CORS allow-list, audit log. Check: the 12 security tests in `docs/SECURITY.md` section 10 pass.

### Step 3: Develop course management features

- **Phase 4, courses, content, enrollment:** modules `courses`, `content`, `enrollments`, `files`, `users`, `admin`. Policies, pagination, search, publish checklist. Check: integration tests cover every status code.

### Step 4: Add quizzes, assignments and progress tracking

- **Phase 5, assessments and progress:** follow the `assessment-engine` skill. Quiz attempts with server deadline, autosave, auto-grading, no answer leakage. Assignments with validated uploads, late penalty, grading. Progress events, `progressPct`, dashboard endpoint, gradebook. Check: boundary tests for deadlines, double submit, penalty arithmetic and progress pass.

### Frontend (Steps 1 to 4, in parallel with the API once contracts exist)

- **Phase 6, design foundation:** follow `frontend-ui` and the design system. `tokens.css` (chalk, board, pencil, 60/30/10), Tailwind mapping, IBM Plex fonts, global styles, `components/ui` primitives, a temporary `/__kit` page showing every primitive in every state. Check: the kit page matches `docs/design-reference.html`.
- **Phase 7, student experience:** AppShell, auth screens, dashboard with Resume panel and Lesson Trail, catalog, course page, lesson viewer, quiz player and results, assignment submission, grades. Check: component tests pass, `design-review` clean at 1440, 768 and 390.
- **Phase 8, instructor and admin experience:** course builder, question editor, submissions queue and grading, gradebook, progress summary, admin users and audit log. Check: Playwright paths for instructor and admin pass.

### Step 5: Deploy and optimize

- **Phase 9, quality and security pass:** run `/verify`, `/security-review` and `/review-design`. Playwright paths for all three roles with axe checks. Fix everything reported.
- **Phase 10, deploy and optimize:** follow `devops-optimization`. Dockerfiles, production compose with Caddy, backups and restore doc, CI and release workflows, caching headers, bundle and Lighthouse budgets, k6 load test, query optimization with before and after numbers. Check: `/perf-audit` meets the budgets and a fresh machine can run the stack with the README instructions only.

## 4. Quality bar

- Strict TypeScript, ESLint and Prettier clean, zero warnings. Every rule in `.agents/rules/` respected.
- Architecture rules enforced by tooling where possible (module boundaries, no cross-module repository imports).
- Accessible: WCAG 2.2 AA, keyboard operable, visible focus, labelled controls, live-region announcements in the quiz timer.
- Interface follows the design system exactly: board and pencil on chalk at 60/30/10, IBM Plex scale, Lesson Trail as the signature, no banned patterns.
- Tests at every level, 85% line coverage on services and policies.
- Documentation accurate: README, architecture (with new ADR rows), security, deployment.

## 5. Do not

- Do not substitute the stack or add dependencies beyond those listed without an ADR.
- Do not put business logic in controllers, repositories or components.
- Do not trust the client for role, score, correctness or time.
- Do not use `any`, raw hex values in components, gradients, progress rings, sparklines, emoji icons, or placeholder content.
- Do not weaken or delete a failing test or check to proceed.
- Do not add Redis, queues or Kubernetes. They are documented as the scaling path only.

## 6. Definition of done

- On a clean machine: `npm install`, `docker compose up -d db mailpit`, `npm run db:migrate`, `npm run db:seed`, `npm run dev` gives a working app with the demo accounts from the README.
- `npm run lint`, `npm run typecheck`, `npm run test` and `npm run test:e2e` all pass, including the 12 security tests.
- Production compose runs the stack behind Caddy, with health checks, backups and the documented release process.
- Budgets met: initial JS under 180KB gzipped, Lighthouse 90+ on the dashboard, API p95 under 200ms for reads.
- Final message includes a walkthrough: what was built, architecture in a few lines, test and security results, performance numbers, screenshots of student dashboard, lesson, quiz, builder and gradebook at three widths, and every deviation from this brief with the reason.
