# Project standards (always on)

Binding for every file written in this workspace. If a task seems to require breaking a rule, stop and explain why instead of breaking it silently.

## Code quality

- TypeScript `strict: true` everywhere. No `any`, no `@ts-ignore`, no non-null assertion without a comment explaining the invariant.
- One responsibility per function and file. Functions under 40 lines, files under 250 lines (React components under 150).
- Names reveal intent (`findActiveEnrollment`, not `getData`). No abbreviations except `id`, `url`, `db`, `api`, `dto`.
- Early returns over nesting. No boolean flag parameters that change behavior.
- No magic numbers or strings. Shared values are named constants or enums in `packages/contracts`.
- No commented-out code, no stray `console.log`, no `TODO` without an issue reference. Use the logger on the server.
- Never swallow errors with an empty `catch`. Throw typed errors (`AppError` with a stable `code`) and let the global filter shape the response.
- Prefer named exports. Imports ordered: node and external, workspace packages, internal absolute, relative.

## Architecture (see docs/ARCHITECTURE.md)

- API is a modular monolith: `controller -> service -> repository`, with pure `policy` functions for authorization. Only repositories touch Prisma.
- A module imports another module only through its public `index.ts`. Cross-module reactions use domain events. No circular dependencies.
- Every request and response shape is a Zod schema in `packages/contracts`. Types are inferred, never duplicated. Unknown keys are rejected.
- Web is organized by feature. Server state in TanStack Query, form state in React Hook Form, filters and tabs in the URL. Never copy query data into `useState`.
- Authorization is two-layered: role guard on the route and ownership or membership policy in the service. Queries touching user-owned data are scoped by user or enrollment.
- Business rules (grading, progress, quiz timing) live in services and are unit-tested without HTTP.

## Database

- Every schema change is a Prisma migration with a descriptive name. Never edit an applied migration.
- Explicit `select` or `include`. Review list endpoints for N+1 queries. Add the indexes listed in the architecture document.
- Multi-step writes use a transaction. Timestamps in UTC.

## Configuration and dependencies

- Configuration only from environment variables, validated at startup. `.env.example` is committed, `.env` never.
- Add a dependency only when needed and justify it in the commit message. Prefer the platform and existing dependencies.

## Git and quality gates

- Conventional Commits, small focused commits, one concern each.
- A phase is finished only when `npm run lint`, `npm run typecheck` and `npm run test` pass with zero warnings.
- Docs stay true: update README, architecture or security docs in the same change that alters behavior. Add an ADR row for architectural decisions.
- Cross-cutting rules live in their own files: `security-rules.md` and `design-guardrails.md`.
