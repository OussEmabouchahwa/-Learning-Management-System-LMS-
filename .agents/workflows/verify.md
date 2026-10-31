---
description: Run every quality gate and report the result
---

1. From the repository root run `npm run lint`, `npm run typecheck`, `npm run test`. Report failures with file and line.
2. Run `npm run build` for every workspace.
3. Start the stack (`docker compose up -d db mailpit`, `npm run db:migrate`, `npm run dev`) and confirm `GET /health` and `GET /ready`.
4. Run `npm run test:e2e` and the 12 security tests.
5. Check that `README.md`, `docs/ARCHITECTURE.md` and `docs/SECURITY.md` match the code (scripts, endpoints, ADRs).
6. Produce a short report: gates passed, gates failed, next action for each failure.
