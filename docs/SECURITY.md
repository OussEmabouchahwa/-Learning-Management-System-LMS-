# Security: Dars LMS

Security is a feature with acceptance criteria, not a final pass. Every control below has a test or a check in the Definition of Done.

## 1. Assets and actors

**Assets:** accounts and credentials, grades, quiz answer keys, student submissions (files and text), personal data (name, email), course content.

**Actors:** anonymous visitor, student, instructor, admin, and attackers: credential stuffers, cheating students, malicious instructors or uploaders, XSS payload authors.

## 2. Threat model (condensed STRIDE)

| Threat | Example | Control |
|---|---|---|
| Spoofing | Stolen or guessed password, stolen refresh token | argon2id, rate limits and backoff, rotating refresh tokens with reuse detection, httpOnly SameSite=Strict cookie |
| Tampering | Student edits another student's submission or grade | Ownership scoping on every query, grade endpoints restricted to course owner and admin |
| Repudiation | Instructor denies changing a grade | Append-only audit log for grade changes, role changes, publish, delete |
| Information disclosure | Answer key in quiz payload, IDOR on `/submissions/:id`, user enumeration | Answers withheld until submitted, policies on every read, uniform auth errors |
| Denial of service | Login flood, huge upload, expensive list queries | Throttling, body and file size limits, pagination caps, query timeouts |
| Elevation of privilege | Student registers as instructor, mass assignment of `role` | Registration always creates STUDENT, role changes admin-only, Zod `strict()` schemas drop unknown fields |
| XSS (lesson content) | Instructor or student injects script via Markdown or feedback | Markdown rendered with `rehype-sanitize`, strict CSP, no `dangerouslySetInnerHTML` of raw input |
| Cheating | Replaying attempts, tampering with timer, reading answers from network | Server-authoritative timing, limited attempts, shuffled options, no answers before submit |

## 3. Authentication

- **Password hashing:** argon2id with tuned memory cost. Minimum 10 characters, maximum 128, check against a small common-password list. No composition rules that push predictable patterns.
- **Access token:** JWT, 15 minutes, signed with a rotating secret (`kid` header). Kept only in client memory.
- **Refresh token:** 256-bit random, stored as SHA-256 hash, 7-day lifetime, rotated on each use, family revocation on reuse. Cookie flags: `HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth`.
- **Logout:** revokes the token family and clears the cookie. "Log out everywhere" revokes all families for the user.
- **Email verification and password reset:** single-use random tokens, stored hashed, expire (verify 24h, reset 30 min), always respond identically whether or not the email exists. Password change revokes all sessions.
- **Brute force:** per IP and per account throttling (for example 5 attempts per minute then exponential backoff). Do not lock accounts permanently (that enables denial of service).

## 4. Authorization

- Default deny. Every route declares its roles. Routes without a guard fail a CI check.
- Ownership and membership are enforced in the service through a policy, and in the repository by scoping queries (`where: { id, userId }`).
- Return `404` rather than `403` for resources the caller must not know exist.
- Admin actions are audited.

## 5. Input, output and files

- Validate every body, query and param with Zod at the edge. Unknown keys are rejected.
- Prisma parameterizes queries. Never build SQL by concatenation. Raw queries are reviewed individually.
- Output encoding by React. Markdown goes through a sanitizer with an allow-list of elements. Links get `rel="noopener noreferrer"`.
- Uploads: allow-list by extension **and** magic bytes (pdf, docx, zip, png, jpg, txt, md), maximum 10 MB, random storage names, stored outside the web root, served only through the authorized `/files/:id` endpoint with `Content-Disposition: attachment` and `X-Content-Type-Options: nosniff`. Provide a hook for malware scanning (ClamAV) behind the `StorageService`.
- Video embeds only from an allow-list (YouTube, Vimeo) with `frame-src` in the CSP.

## 6. Transport, headers, browser

- HTTPS only (HSTS in production). `helmet` defaults plus a strict CSP: `default-src 'self'`, no inline scripts, `frame-src` allow-list, `img-src 'self' data:`, `connect-src 'self'`.
- CORS: explicit allow-list of origins from environment, credentials only for those origins.
- CSRF: refresh endpoint is protected by `SameSite=Strict` and an `Origin` header check. State-changing endpoints use the bearer token (not ambient cookie authority), so they are not CSRF-able.
- Limit request body size (`10kb` JSON, multipart per route). Disable `X-Powered-By`.

## 7. Secrets, logging, data

- Secrets only from environment variables. `.env` is git-ignored, `.env.example` lists every key with a safe placeholder. Production secrets live in the host's secret store.
- Logs never contain passwords, tokens, full emails, quiz answers or file contents. Redact by key list in the logger.
- Backups are encrypted and restore-tested. Personal data export and account deletion (anonymization that preserves grade integrity) are supported.

## 8. Supply chain

- Lockfile committed. `npm audit --omit=dev` and Dependabot (or Renovate) in CI. Pin base image versions. Run containers as non-root with a read-only filesystem where possible.
- New dependencies need a justification in the PR description.

## 9. OWASP Top 10 (2021) mapping

| Risk | Where it is handled |
|---|---|
| A01 Broken access control | Sections 3 and 4, policy tests, IDOR tests |
| A02 Cryptographic failures | argon2id, hashed tokens, TLS, HSTS |
| A03 Injection | Zod, Prisma, sanitizer |
| A04 Insecure design | Threat model, server-authoritative quiz design |
| A05 Security misconfiguration | helmet, CSP, CORS allow-list, non-root containers |
| A06 Vulnerable components | Audit in CI, Dependabot |
| A07 Identification and authentication failures | Section 3 |
| A08 Software and data integrity failures | Lockfile, CI-built images, signed tags |
| A09 Logging and monitoring failures | Audit log, structured logs, alerts on auth anomalies |
| A10 SSRF | No server-side fetch of user-supplied URLs. Video links are rendered as embeds by the browser |

## 10. Required security tests

These must exist and pass before the project is considered done:

1. A student cannot read another student's submission, attempt or grade (IDOR, expect 404).
2. A student cannot call instructor or admin endpoints (expect 403).
3. An instructor cannot edit or grade a course they do not own.
4. Registration cannot set `role`, extra fields are rejected.
5. A used refresh token revokes its whole family.
6. Login and password-reset responses are identical for existing and unknown emails.
7. The quiz attempt payload contains no `isCorrect` data before submission.
8. Submitting after the deadline plus grace is rejected or marked expired.
9. An upload with a mismatched extension and content, or an oversized file, is rejected.
10. A Markdown lesson containing `<script>` and `onerror` renders inert.
11. Rate limit returns `429` after the configured number of failed logins.
12. CSP and security headers are present on every response (checked in an integration test).
