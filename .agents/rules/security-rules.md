# Security rules (always on)

Authoritative detail is in `docs/SECURITY.md`. These apply to every change.

1. **Default deny.** Every route declares its roles. A route without a guard is a defect.
2. **Never trust the client.** Role, user id, score, deadline, attempt count and quiz timing come from the server. Ignore any such field in a request body.
3. **Scope every query** by the authenticated user or enrollment. Return 404 for resources the caller must not know exist.
4. **Validate at the edge** with strict Zod schemas. Reject unknown keys.
5. **No secrets in code, logs or git.** No tokens, passwords, emails, quiz answers or file contents in logs.
6. **Tokens:** access JWT lives in memory only. Refresh token is an opaque, hashed, rotating httpOnly cookie. Never use localStorage or sessionStorage for credentials.
7. **Passwords** use argon2id. Auth errors never reveal whether an account exists.
8. **Quiz integrity:** never send `isCorrect`, answer keys or explanations while an attempt is in progress.
9. **Uploads:** allow-list by extension and magic bytes, size limit, random names, outside the web root, served only through the authorized endpoint.
10. **Output:** never use `dangerouslySetInnerHTML` with unsanitized input. Markdown passes through the sanitizer.
11. **Headers and CORS:** helmet with a strict CSP, explicit CORS origins, rate limiting on auth and write endpoints.
12. **Audit** grade changes, role changes, publish, archive and delete.
13. Any change touching auth, authorization, uploads or quizzes needs a matching security test from `docs/SECURITY.md` section 10, or a new one.
