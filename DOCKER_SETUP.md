# GPMH Platform - Docker Setup Guide

## Quick Start

```bash
# 1. Add host entries (one-time setup)
echo "127.0.0.1 gpmh.local admin.gpmh.local sonimoha.gpmh.local" | sudo tee -a /etc/hosts

# 2. Build and start all services
docker compose build
docker compose up -d

# 3. Wait ~15 seconds for DB setup + seeding, then check
docker compose logs backend --tail 20
```

## Services

| Service    | Container        | Internal Port | Host Port | Purpose                     |
|------------|-----------------|---------------|-----------|----------------------------|
| postgres   | gpmh-postgres   | 5432          | 5433      | PostgreSQL 16 database      |
| redis      | gpmh-redis      | 6379          | —         | Redis 7 (internal only)     |
| backend    | gpmh-backend    | 5000          | —         | Node.js API (internal only) |
| frontend   | gpmh-frontend   | 80            | —         | React SPA (internal only)   |
| gateway    | gpmh-gateway    | 80            | **80**    | Nginx reverse proxy         |

All traffic goes through the **gateway** on port 80. Backend and frontend are only reachable internally.

## Login Credentials

| Role           | URL                              | Email                    | Password      |
|----------------|----------------------------------|--------------------------|---------------|
| **SuperAdmin** | http://admin.gpmh.local          | `admin@platform.com`     | `Admin@123`   |
| **Village Admin** | http://sonimoha.gpmh.local    | `admin@sonimoha.com`     | `Village@123` |
| **Citizen**    | http://sonimoha.gpmh.local       | `citizen@demo.com`       | Email OTP     |

> For citizen login, use email OTP flow. OTP is logged in backend container logs:
> ```bash
> docker compose logs backend --tail 30
> ```

## Demo Data (Village: सोनीमोहा / Sonimoha)

- **7** GP Members (Sarpanch, Upsarpanch, Gramsevak, 4 Members)
- **6** Notices (Gramsabha, water schedule, events, etc.)
- **5** Programs (road, school, water supply, LED lights, toilets)
- **3** Schemes (PMAY, MGNREGA, PM-KISAN)
- **3** Awards (Nirmal Gram, Tanta Mukt, National Panchayat)
- **12** Certificate Types (birth, death, marriage, residence, etc.)
- **1** Payment Config (UPI + bank details)
- **1** Demo Citizen with family (FAM-SONI-0001, 3 members)

## Common Commands

```bash
# Start / stop
docker compose up -d
docker compose down

# Rebuild after code changes
docker compose build backend   # backend only
docker compose build frontend  # frontend only
docker compose build           # both

# View logs
docker compose logs backend -f
docker compose logs gateway -f

# Reset everything (deletes all data)
docker compose down -v
docker compose up -d

# Access database directly
docker exec -it gpmh-postgres psql -U gpmh_user -d gpmh_platform
```

## Architecture

```
Browser → http://sonimoha.gpmh.local
         ↓
    [Nginx Gateway :80]
         ├── /api/*     → backend:5000
         ├── /uploads/* → backend:5000
         └── /*         → frontend:80 (SPA)
```

- Subdomain routing: `admin.gpmh.local` / `sonimoha.gpmh.local` / `*.gpmh.local`
- Backend tenant detection via `Host` header subdomain
- Frontend auto-detects environment (dev port 5173 → backend:5000, Docker port 80 → same origin)

## Development Mode (without Docker)

```bash
# Terminal 1: Backend
cd backend
cp .env.example .env  # or use existing .env
npm install
npx prisma db push
npm run db:seed
npm run dev

# Terminal 2: Frontend
cd frontend
npm install --legacy-peer-deps
npm run dev
```

Dev mode uses Vite on port 5173, routing API calls to `localhost:5000` automatically.
