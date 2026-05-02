# Production Deployment Workflow — ePanchayatRaj

> **Golden Rule:** Never edit files directly on the VPS. Always develop locally → push to GitHub → pull on VPS.

---

## Overview

```
Local Machine  →  GitHub (private repo)  →  VPS (epanchayatraj.in)
   (dev)              (git push)               (git pull + rebuild)
```

**VPS details:**
- User: `deploy@srv1615166`
- Project path: `/opt/epanchayatraj/epanchayatraj-platform`
- GitHub repo: `https://github.com/AvinashRamrajTonde/epanchayatraj-platform`

---

## Step 1 — Make Changes Locally

```bash
# Create a feature branch (recommended)
git checkout -b fix/image-url-issue

# Or work directly on main for small fixes
git checkout main
```

---

## Step 2 — Test Locally Before Pushing

```bash
# Frontend
cd frontend
npm run build
npx tsc --noEmit

# Backend
cd backend
npx tsc --noEmit

# Run full stack locally
cd /path/to/village-platform
docker compose up --build
```

---

## Step 3 — Commit and Push to GitHub

```bash
git add .
git commit -m "fix: describe what you changed"
git push origin main
# or push feature branch:
git push origin fix/image-url-issue
```

If using a feature branch, merge via GitHub PR or:
```bash
git checkout main
git merge fix/image-url-issue
git push origin main
```

---

## Step 4 — Pull on VPS

```bash
ssh deploy@srv1615166

cd /opt/epanchayatraj/epanchayatraj-platform

git pull origin main
```

---

## Step 5 — Rebuild Only What Changed

### Frontend changed (React/TypeScript/CSS)
```bash
docker compose build frontend
docker compose up -d frontend
```

### Backend changed (Node.js/Express/API)
```bash
docker compose build backend
docker compose up -d backend
```

### Both frontend and backend changed
```bash
docker compose build frontend backend
docker compose up -d frontend backend
```

### Database schema changed (Prisma migration)
```bash
docker compose build backend
docker compose up -d backend

# Run migration
docker compose exec backend npx prisma migrate deploy
```

### Nginx config changed (`nginx/conf.d/default.conf`)
```bash
# Test config first
docker compose exec nginx nginx -t

# Reload nginx (no downtime)

```

### Environment variables changed (`.env`)
```bash
# Edit .env on VPS (this file is NOT in git — never commit it)
nano .env

# Restart affected services
docker compose up -d backend
# or full restart:
docker compose up -d
```

---

## Step 6 — Verify After Deploy

```bash
# Check all containers are running
docker compose ps

# Check logs for errors
docker compose logs --tail=50 backend
docker compose logs --tail=50 frontend
docker compose logs --tail=50 nginx

# Test HTTP → HTTPS redirect
curl -I http://epanchayatraj.in

# Test HTTPS response
curl -I https://epanchayatraj.in

# Test admin panel
curl -I https://admin.epanchayatraj.in

# Test a village subdomain
curl -I https://chandanwadi.epanchayatraj.in
```

---

## Quick Reference Table

| What changed | Rebuild command | Restart command |
|---|---|---|
| Frontend only | `docker compose build frontend` | `docker compose up -d frontend` |
| Backend only | `docker compose build backend` | `docker compose up -d backend` |
| Frontend + Backend | `docker compose build frontend backend` | `docker compose up -d frontend backend` |
| Prisma schema | `docker compose build backend` | `docker compose up -d backend` + `exec backend npx prisma migrate deploy` |
| Nginx config | *(no rebuild needed)* | `docker compose exec nginx nginx -s reload` |
| `.env` vars | *(no rebuild needed)* | `docker compose up -d` |
| Everything | `docker compose build` | `docker compose up -d` |

---

## Full Restart (Emergency)

```bash
# Stop all containers
docker compose down

# Start all containers
docker compose up -d

# View live logs
docker compose logs -f
```

---

## SSL Certificate Renewal

Certificates are managed by Let's Encrypt / Certbot. They auto-renew, but to test or force renewal:

```bash
# Dry run (test only, no changes)
sudo certbot renew --dry-run

# Force renewal
sudo certbot renew --force-renewal

# After renewal, reload nginx
docker compose exec nginx nginx -s reload
```

### Certificate paths on VPS:

| Domain | Cert path |
|---|---|
| `epanchayatraj.in`, `admin.*`, `www.*` | `/etc/letsencrypt/live/epanchayatraj.in/` |
| `*.epanchayatraj.in` (wildcard) | `/etc/letsencrypt/live/epanchayatraj.in-0001/` |
| `admin.epanchayatraj.in` (standalone) | `/etc/letsencrypt/live/admin.epanchayatraj.in/` |

---

## Docker Compose Common Commands

```bash
# List running containers and their status
docker compose ps

# View logs of a specific service
docker compose logs -f backend

# Exec into a container
docker compose exec backend sh
docker compose exec postgres psql -U postgres

# Check nginx config syntax
docker compose exec nginx nginx -t

# Reload nginx without downtime
docker compose exec nginx nginx -s reload

# Remove unused images/volumes (free disk space)
docker system prune -f
```

---

## Golden Rules

1. **Never edit files directly on the VPS.** Always use the git workflow.
2. **Never commit `.env` files.** Keep secrets out of git.
3. **Always test locally** (`npm run build`, `tsc --noEmit`) before pushing.
4. **Backup `.env` on the VPS** — it's not in git and cannot be recovered from GitHub.
5. **Use `nginx -t`** before reloading nginx to avoid downtime from config errors.
6. **Use `git pull` on VPS**, not `git clone` again — the repo is already cloned.
7. **Only rebuild what changed** — avoid rebuilding all containers unnecessarily.

---

## Fixing the Image URL `:5000` Issue

Images load with `:5000` port in src URLs because the backend constructs URLs using `req.get('host')` which includes the internal port.

**Fix:** Add `APP_URL` to backend `.env` and update URL construction in backend code.

```bash
# On VPS, edit .env
nano /opt/epanchayatraj/epanchayatraj-platform/.env

# Add this line:
APP_URL=https://epanchayatraj.in
```

Then in backend code, replace:
```js
// ❌ Wrong — includes :5000 port
const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;

// ✅ Correct — uses APP_URL from env
const fileUrl = `${process.env.APP_URL}/uploads/${filename}`;
```

After fixing:
```bash
docker compose build backend
docker compose up -d backend
```
