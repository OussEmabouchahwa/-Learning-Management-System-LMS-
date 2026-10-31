---
description: Audit authentication, authorization and input handling
---

1. Follow `docs/SECURITY.md`. For each of the 12 required security tests, confirm it exists, runs and passes.
2. List every route and verify it has a role guard or an explicit `@Public()` with a reason.
3. Grep repositories for user-owned queries lacking user or enrollment scoping.
4. Check headers on a live response (CSP, HSTS in production mode, nosniff), CORS origins, cookie flags.
5. Run `npm audit --omit=dev` and list findings with severity.
6. Report findings ranked by severity with a fix for each.
