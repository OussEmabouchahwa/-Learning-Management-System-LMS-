---
name: testing-qa
description: Writes and runs unit, integration, security, component and end-to-end tests for the Dars LMS using Jest, Supertest, Vitest, Testing Library and Playwright, and checks coverage. Use when adding or changing behavior, fixing bugs, validating a phase, or verifying the security test list.
---

# Testing and QA

## Goal

Every behavior that matters has a test that fails when it breaks. Tests read like documentation.

## Instructions

1. **Pyramid:** many unit tests (services, policies, pure functions), solid API integration tests against a real PostgreSQL test database (migrated, cleaned between tests), focused component tests, three Playwright paths.
2. **Unit:** services with fake repositories (grading arithmetic, progress calculation, late penalty, quiz deadline), every branch of every policy, token rotation logic.
3. **Integration (Supertest):** every endpoint and every status code in the contract, including 400 field errors, 401, 403, 404, 409, 429.
4. **Security tests:** all 12 from `docs/SECURITY.md` section 10 are mandatory and live in `security.e2e-spec.ts`.
5. **Component (Testing Library):** query by role and accessible name. Cover LessonTrail text alternative, QuizPlayer timer and autosave states, form server-error mapping, empty and error states, dialog focus return.
6. **End to end (Playwright):** student (login, resume lesson, complete lesson, take quiz, submit assignment, see grade), instructor (create course, add module and lesson, publish, grade a submission), admin (change a role, view audit log). Capture screenshots at 1440 and 390 widths.
7. **Accessibility:** `axe` checks inside Playwright on dashboard, lesson, quiz and gradebook pages. Zero serious or critical violations.
8. **Naming:** `it("rejects a submission after the deadline plus grace")`. Behavior, not implementation.
9. **Coverage targets:** 85% lines on services and policies, no coverage chasing on glue code.
10. **Report after a run:** passed and failed, coverage numbers, untested behavior and why.

## Commands

```
npm run test            unit and integration, all workspaces
npm run test:e2e        Playwright
npm run test:coverage   coverage report
```

## Constraints

- Never edit a test to make it pass without explaining the behavior change.
- Never mock what can run for real (database, Nest app, clock control excepted through fake timers).
- No arbitrary sleeps. Wait on roles, text or network.
