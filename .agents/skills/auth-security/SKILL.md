---
name: auth-security
description: Implements and reviews authentication, authorization and application security for the Dars LMS, including argon2id passwords, JWT access tokens, rotating refresh cookies, RBAC and ownership policies, rate limiting, uploads, CSP and audit logging. Use when touching login, registration, tokens, guards, permissions, file uploads, headers or anything handling untrusted input.
---

# Auth and security

## Goal

Implement the controls in `docs/SECURITY.md` correctly and prove them with tests.

## Instructions

1. **Registration and login.** Zod-validate input. Hash with argon2id. Registration always creates a STUDENT. Responses and timing are the same for unknown email and wrong password (hash a dummy value when the user is missing).
2. **Tokens.**
   - Access JWT, 15 minutes, signed with the secret from config, claims `sub`, `role`, `jti`. Sent as `Authorization: Bearer`.
   - Refresh token: `crypto.randomBytes(32)`, stored as SHA-256 hash with `familyId`, `expiresAt`, `usedAt`, `revokedAt`. Set as cookie with `HttpOnly; Secure (production); SameSite=Strict; Path=/api/v1/auth`.
   - `POST /auth/refresh`: look up by hash, reject if expired or revoked. If `usedAt` is set, revoke the entire family and return 401. Otherwise mark used and issue a new pair in one transaction. Check the `Origin` header against the allow-list.
3. **Client.** The web app keeps the access token in a module-level variable, refreshes on 401 once (single in-flight refresh shared by concurrent requests), then retries. On refresh failure it clears state and routes to login. Never use localStorage for tokens.
4. **Guards.** A global `JwtAuthGuard` with an explicit `@Public()` opt-out, plus `RolesGuard`. A CI check lists routes lacking either.
5. **Policies.** Write pure functions per resource (`canEditCourse`, `canReadLesson`, `canGradeSubmission`). Unit-test every branch. In repositories always scope by user or enrollment.
6. **Rate limiting.** `@nestjs/throttler`: strict on `/auth/*` (per IP and per email), moderate elsewhere. Return 429 with `Retry-After`.
7. **Password reset and verification.** Single-use random tokens stored hashed, with expiry. Identical responses whether or not the email exists. Password change revokes all refresh families.
8. **Uploads.** Check extension allow-list, magic bytes (`file-type`), size, generate a random key, store through `StorageService`, serve via authorized endpoint with `Content-Disposition: attachment` and `nosniff`.
9. **Headers.** `helmet` with CSP from the security document, HSTS in production, CORS allow-list from env.
10. **Audit.** Write an `AuditLog` row (actor, action, target, metadata, requestId) for grade changes, role changes, publish, archive, delete and failed admin actions.
11. **Tests.** Implement all 12 security tests in `docs/SECURITY.md` section 10 as automated tests. Do not mark security work done without them.

## Constraints

- Never log tokens, passwords or full emails.
- Never accept `role`, `userId`, `score`, `isCorrect` or timestamps from the client.
- Never weaken a security test to make it pass. Fix the code.
