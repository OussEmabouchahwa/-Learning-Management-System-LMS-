# Dars LMS — Backup & Disaster Recovery Runbook

This document defines the procedure for backing up and restoring Dars LMS production databases and uploaded files.

---

## 1. Automated Daily Backup (Cron)

PostgreSQL database dumps are taken daily and stored with gzip compression:

```bash
# Example backup command run inside db container
docker compose -f deploy/docker-compose.prod.yml exec -T db \
  pg_dump -U dars_user dars | gzip > /backups/dars_$(date +\%Y\%m\%d_\%H\%M\%S).sql.gz
```

Upload directory backup:
```bash
tar -czf /backups/uploads_$(date +\%Y\%m\%d_\%H\%M\%S).tar.gz -C /var/lib/docker/volumes/deploy_uploads/_data .
```

---

## 2. Recovery Procedure

### Step 1: Stop API traffic
Stop the API and Web services to avoid concurrent writes:
```bash
docker compose -f deploy/docker-compose.prod.yml stop api web
```

### Step 2: Database Restoration
Decompress and restore the targeted snapshot into PostgreSQL:
```bash
gunzip -c /backups/dars_20261031_000000.sql.gz | \
  docker compose -f deploy/docker-compose.prod.yml exec -T db \
  psql -U dars_user -d dars
```

### Step 3: File Storage Restoration
Extract uploaded attachments:
```bash
tar -xzf /backups/uploads_20261031_000000.tar.gz -C /var/lib/docker/volumes/deploy_uploads/_data
```

### Step 4: Run Migrations Check
Verify schema matches application code:
```bash
docker compose -f deploy/docker-compose.prod.yml run --rm api npx prisma migrate deploy
```

### Step 5: Restart Services & Verify Health
```bash
docker compose -f deploy/docker-compose.prod.yml start api web
curl -f http://localhost:4000/api/v1/health
```
