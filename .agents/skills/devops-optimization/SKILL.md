---
name: devops-optimization
description: Containerizes, deploys and optimizes the Dars LMS using multi-stage Docker builds, Docker Compose, Caddy HTTPS, GitHub Actions CI/CD, health checks, backups, database tuning, caching headers, bundle budgets and k6 load tests. Use when working on Dockerfiles, compose files, pipelines, environment configuration, performance, observability or release steps.
---

# DevOps and optimization

## Goal

One command to run locally, a repeatable path to production, and measured performance against stated budgets.

## Deployment assets (`deploy/`)

1. **Dockerfiles** (multi-stage, pinned base images, non-root user, `.dockerignore`): `api.Dockerfile` (build, prune dev deps, run `node dist/main`), `web.Dockerfile` (build with Vite, serve with Nginx).
2. **`docker-compose.yml`** (root, development services): `db` (postgres:16 with healthcheck and volume) and `mailpit`.
3. **`deploy/docker-compose.prod.yml`:** `caddy` (automatic HTTPS), `web`, `api`, `db`, `backup` (nightly `pg_dump` to a separate volume with retention). Healthchecks on every service, `restart: unless-stopped`, resource limits, no published ports except Caddy 80 and 443.
4. **`Caddyfile`:** reverse proxy `/api` to the API, everything else to web, HSTS, gzip and zstd.
5. **`nginx.conf`:** SPA fallback, long cache for hashed assets, `no-cache` for `index.html`, gzip or brotli.
6. **`.env.production.example`** listing every variable with safe placeholders. **`RESTORE.md`** with tested restore steps.
7. **Migrations** run as an explicit step (`prisma migrate deploy`) before the new API takes traffic, never at app boot in production.

## CI/CD (GitHub Actions)

- `ci.yml` on pull requests: install with cache, lint, typecheck, unit and integration tests (with a Postgres service), build, `npm audit --omit=dev`, Playwright on main.
- `release.yml` on version tags: build and push images to GHCR, deploy over SSH (`docker compose pull && up -d`, migrate, health check, automatic rollback to the previous tag if `/ready` fails).
- Secrets only from GitHub Actions secrets.

## Optimization

1. **Database:** confirm the indexes in the architecture document exist, inspect `EXPLAIN` for list, dashboard and gradebook queries with seed scale data, remove N+1 patterns, set the pool size and statement timeout.
2. **API:** gzip, `ETag` and `Cache-Control` on catalog reads, pagination caps, request timeouts.
3. **Web:** route-level splitting, preloaded fonts (two primary faces), image dimensions, bundle analyzer, initial JS under 180KB gzipped, LCP under 2.5s, CLS under 0.1.
4. **Load test:** `perf/k6/main.js` simulating login, dashboard, lesson read and quiz attempt flows. Thresholds: p95 under 200ms for reads, error rate under 1%. Exposed as `npm run perf:load`.
5. **Lighthouse CI** on the dashboard with a performance score budget of 90.
6. **Observability:** JSON logs with `requestId`, `/health`, `/ready`, optional `/metrics`, documented alerts (error rate, p95, failed logins spike, disk usage).

## Report after any change

Before and after numbers (bundle size, p95, query time), what was measured and how.

## Constraints

- No secrets in images or in git. No `latest` tags. No root containers.
- No premature infrastructure: do not add Redis, queues or Kubernetes without a measured need and an ADR.
