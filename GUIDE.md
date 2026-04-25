# GPMH Platform — Developer Guide

> Complete setup, development, deployment and testing guide for junior developers.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Prerequisites](#4-prerequisites)
5. [Local Development Setup](#5-local-development-setup)
6. [Demo Credentials](#6-demo-credentials)
7. [How the Platform Works](#7-how-the-platform-works)
8. [Common Development Tasks](#8-common-development-tasks)
9. [Docker Deployment](#9-docker-deployment)
10. [Testing Checklist](#10-testing-checklist)
11. [Troubleshooting](#11-troubleshooting)
12. [Reset / Fresh Start](#12-reset--fresh-start)

---

## 1. Project Overview

GPMH is a **multi-tenant village platform** — one system that hosts websites for many gram panchayats. Each village gets its own subdomain: `sonimoha.gpmh.local`, `nashik.gpmh.local`, etc.

There are three portals:
| Portal | URL | Who Uses It |
|---|---|---|
| Village Website | `http://sonimoha.gpmh.local` | Public / Citizens |
| Village Admin | `http://sonimoha.gpmh.local/admin` | Village admin, Gramsevak |
| Super Admin | `http://admin.gpmh.local` | Platform owner (you) |

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | Node.js + Express.js (ESM modules) |
| Database | PostgreSQL 16 (via Prisma ORM) |
| Cache | Redis 7 |
| Containerization | Docker + Docker Compose |
| Web Server | Nginx (subdomain routing) |
| Auth | JWT (access + refresh tokens) |

---

## 3. Project Structure

```
village-platform/
├── backend/              ← Node.js API server
│   ├── prisma/
│   │   ├── schema.prisma       ← Database schema (single source of truth)
│   │   ├── seed-all.js         ← Demo data seeder
│   │   └── seed.js             ← Minimal seeder (superadmin only)
│   ├── src/
│   │   ├── config/             ← DB, constants
│   │   ├── controllers/        ← Route handlers
│   │   ├── middleware/         ← Auth, RBAC, validation
│   │   ├── routes/             ← API route definitions
│   │   ├── services/           ← Business logic
│   │   └── server.js           ← Express app entry point
│   ├── .env                    ← Backend environment variables
│   └── Dockerfile
│
├── frontend/             ← React SPA
│   ├── src/
│   │   ├── pages/
│   │   │   ├── superadmin/     ← Super admin pages
│   │   │   └── village-admin/  ← Village admin pages
│   │   ├── themes/
│   │   │   ├── classic/        ← Classic theme (orange)
│   │   │   └── modern/         ← Modern theme (teal)
│   │   ├── services/           ← API calls (axios)
│   │   └── context/            ← React context (tenant, auth)
│   ├── .env                    ← Frontend environment variables
│   └── Dockerfile
│
├── nginx/
│   └── default.conf    ← Subdomain routing config
├── docker-compose.yml  ← Full stack Docker setup
└── GUIDE.md            ← This file
```

---

## 4. Prerequisites

Install these before starting:

```bash
# Required
node --version      # Need v20+
npm --version       # Need v10+
docker --version    # Need v24+
docker compose version  # Need v2+

# Install Node.js 20 (if not installed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Configure `/etc/hosts`** (do this once on your machine):

```bash
sudo nano /etc/hosts
```

Add this line:
```
127.0.0.1  gpmh.local admin.gpmh.local sonimoha.gpmh.local
```

Save with `Ctrl+O`, exit with `Ctrl+X`.

---

## 5. Local Development Setup

### Option A: Quickest (Dev Mode — recommended for development)

**Step 1: Start databases**
```bash
cd village-platform
docker compose up -d postgres redis
```

**Step 2: Install backend dependencies and setup DB**
```bash
cd backend
npm install
npx prisma db push          # Create tables
node prisma/seed-all.js     # Load demo data
```

**Step 3: Start backend**
```bash
npm run dev
# Backend runs at: http://localhost:5000
```

**Step 4: Install frontend dependencies and start**
```bash
cd ../frontend
npm install
npm run dev
# Frontend runs at: http://admin.gpmh.local:5173
```

**Step 5: Open in browser**
- Super Admin: http://admin.gpmh.local:5173
- Village site: http://sonimoha.gpmh.local:5173

---

### Option B: Docker (Production-like, all services)

```bash
cd village-platform
docker compose up --build
```

Wait ~2 minutes for everything to start. Then:
- Super Admin: http://admin.gpmh.local
- Village site: http://sonimoha.gpmh.local

---

## 6. Demo Credentials

> These are seeded automatically by `seed-all.js`

| Role | Email | Password | Where to Login |
|---|---|---|---|
| **Super Admin** | `admin@platform.com` | `Admin@123` | http://admin.gpmh.local/signin |
| **Village Admin** | `admin@sonimoha.com` | `Village@123` | http://sonimoha.gpmh.local/signin |
| **Citizen (demo)** | `citizen@demo.com` | `Citizen@123` | http://sonimoha.gpmh.local/citizen/login |

> **Note for Citizen Login:** The platform uses email OTP by default. If SMTP is not configured, the OTP is printed in the **backend terminal logs**. Search for `OTP` in logs.

---

## 7. How the Platform Works

### Subdomain-Based Multi-Tenancy

Every request has its subdomain checked:
- `admin.gpmh.local` → Super Admin panel
- `sonimoha.gpmh.local` → Sonimoha village portal
- Backend reads `Host` header, finds the matching village in DB

### Themes
Each village can use `classic` (orange) or `modern` (teal) theme. Changed by Super Admin per village.

### Content Flow
```
Village Admin types content
        ↓
Saved in VillageContent table (section + JSON)
        ↓
Public API: GET /api/public/content/:section
        ↓
Village website renders it
```

### Global Settings (Superadmin only)
Emergency numbers and useful links are global — managed from Super Admin → "जागतिक सेटिंग्ज". These show on all villages' "Important Info" page.

---

## 8. Common Development Tasks

### Add a New API Route

1. Add controller function in `backend/src/controllers/`
2. Add route in the matching `backend/src/routes/*.routes.js`
3. If it needs DB changes, update `backend/prisma/schema.prisma`
4. Run `npx prisma db push` to sync

### Add a DB Table

1. Edit `backend/prisma/schema.prisma`
2. Run `npx prisma db push` to create the table
3. Prisma client is auto-regenerated

### Add a New Page to Village Admin

1. Create `frontend/src/pages/village-admin/YourPage.tsx`
2. Add route in `frontend/src/App.tsx` inside the village admin routes block
3. Add link to sidebar in `frontend/src/layout/VillageAdminSidebar.tsx`

### Change Village Theme Color
Edit `frontend/src/themes/fontConfig.ts` for fonts, or theme files in `frontend/src/themes/classic/` / `modern/`.

### View Database (GUI)
```bash
cd backend
npx prisma studio
# Opens at http://localhost:5555
```

---

## 9. Docker Deployment

### First-time setup

```bash
cd village-platform
docker compose up --build -d
```

Docker will:
1. Build backend image (installs deps, generates Prisma client)
2. Build frontend image (runs `vite build`)
3. Start nginx gateway on port 80
4. Run `prisma db push + seed-all.js` on backend startup

### Check logs

```bash
docker compose logs -f backend    # Backend logs
docker compose logs -f frontend   # Frontend nginx logs
docker compose logs -f gateway    # Nginx gateway logs
docker compose logs -f postgres   # Database logs
```

### Restart a single service

```bash
docker compose restart backend
```

### View running containers

```bash
docker compose ps
```

### Rebuild after code changes

```bash
# Rebuild and restart just backend
docker compose up --build backend -d

# Rebuild everything
docker compose up --build -d
```

### Environment Variables for Production

Edit `docker-compose.yml` and change these values before going live:
```yaml
JWT_ACCESS_SECRET: "CHANGE-THIS-TO-RANDOM-SECURE-STRING"
JWT_REFRESH_SECRET: "CHANGE-THIS-TO-ANOTHER-RANDOM-STRING"
SUPERADMIN_EMAIL: "your-real-email@domain.com"
SUPERADMIN_PASSWORD: "YourSecurePassword123!"
```

For real domain (not `.local`), also update:
```yaml
PLATFORM_DOMAIN: "yourdomain.com"
```
And `VITE_API_URL` in the frontend build args.

---

## 10. Testing Checklist

### As Super Admin (`admin@platform.com` / `Admin@123`)

- [ ] Login at http://admin.gpmh.local/signin
- [ ] Dashboard shows village count
- [ ] Villages → see Sonimoha listed
- [ ] Villages → click Sonimoha → view/edit theme
- [ ] Tehsils → list shows इगतपुरी with edit/delete
- [ ] SMTP Settings → fill and test email
- [ ] जागतिक सेटिंग्ज → Add/edit emergency number → verify it saves
- [ ] जागतिक सेटिंग्ज → Add/edit useful link → verify it saves

### As Village Admin (`admin@sonimoha.com` / `Village@123`)

Login at: http://sonimoha.gpmh.local/signin

- [ ] Dashboard loads
- [ ] Content → About → edit and save
- [ ] Content → Contact → update phone/email/pincode → save
- [ ] Content → Hero → manage slides
- [ ] Content → Important → farmingInfo/additionalInfo (emergency/links removed from here)
- [ ] Notices → create a new notice → mark as popup
- [ ] Programs → add a new program
- [ ] Members → edit Sarpanch details
- [ ] Gallery → upload an image
- [ ] Payment Config → check UPI details

### As Citizen (`citizen@demo.com` / `Citizen@123`)

Login at: http://sonimoha.gpmh.local/citizen/login

- [ ] Login works (password or email OTP)
- [ ] Dashboard shows family FAM-SONI-0001
- [ ] Apply for a certificate (e.g. Residence Certificate)
- [ ] Upload a document in the application form
- [ ] Check application status

### Village Website (Public — no login)

Open: http://sonimoha.gpmh.local

- [ ] Home page loads (classic theme, orange colors)
- [ ] Navigation: About, Administration, Notices, Programs, Schemes
- [ ] Notices page shows 6 demo notices
- [ ] Programs page shows 5 demo programs
- [ ] Important Info → Emergency numbers from Global Settings
- [ ] Footer shows GP phone and email
- [ ] Weather widget loads on Important page
- [ ] Language toggle (Marathi ↔ English) works

---

## 11. Troubleshooting

### "Cannot connect to database"
```bash
# Check if postgres container is running
docker compose ps postgres

# Start it if stopped
docker compose up -d postgres

# Verify it's accepting connections
docker exec gpmh-postgres pg_isready -U gpmh_user
```

### "500 error on API calls"
```bash
# Check backend logs
docker compose logs --tail=50 backend
# or if dev mode:
cat /tmp/backend.log | tail -30
```

### "Prisma error: column does not exist"
```bash
cd backend
npx prisma db push    # Sync schema changes to DB
```

### "Frontend shows blank page"
```bash
# Check browser console (F12) for errors
# Check if backend is running:
curl http://localhost:5000/api/public/global-settings
# Rebuild frontend:
cd frontend && npm run build
```

### "HMR not working in dev mode"
The Vite dev server is configured for `admin.gpmh.local`. Make sure your `/etc/hosts` entry exists:
```
127.0.0.1  admin.gpmh.local sonimoha.gpmh.local
```

### "Port 5000 already in use"
```bash
# Find and kill process using port 5000
sudo lsof -ti:5000 | xargs kill -9
# Then restart backend
cd backend && npm run dev
```

### "Docker build fails"
```bash
# Clean Docker cache and rebuild
docker compose down
docker system prune -f
docker compose up --build
```

---

## 12. Reset / Fresh Start

To completely wipe all data and start fresh with demo data:

```bash
cd village-platform

# 1. Stop all services and remove Docker volumes
docker compose down -v

# 2. Remove frontend build
rm -rf frontend/dist

# 3. Start fresh databases
docker compose up -d postgres redis

# 4. Wait for DB to be ready (about 5 seconds)
sleep 6

# 5. Push schema
cd backend && npx prisma db push

# 6. Seed fresh demo data
node prisma/seed-all.js

# 7. Rebuild frontend
cd ../frontend && npm run build

# 8. Start backend
cd ../backend && npm run dev &

# 9. Start frontend dev server
cd ../frontend && npm run dev
```

Or with Docker (all-in-one):
```bash
cd village-platform
docker compose down -v
docker compose up --build -d
# Wait ~2 minutes, then visit http://admin.gpmh.local
```

---

## Quick Reference Card

```
┌──────────────────────────────────────────────────────────┐
│                   GPMH Platform                          │
├──────────────────────────────────────────────────────────┤
│ Start databases:   docker compose up -d postgres redis   │
│ Start backend:     cd backend && npm run dev             │
│ Start frontend:    cd frontend && npm run dev            │
│ View DB (GUI):     cd backend && npx prisma studio       │
├──────────────────────────────────────────────────────────┤
│ Super Admin:  admin@platform.com    / Admin@123          │
│ Village Admin: admin@sonimoha.com  / Village@123         │
│ (login at: http://sonimoha.gpmh.local:5173/signin)       │
│ Citizen:      citizen@demo.com     / Citizen@123         │
├──────────────────────────────────────────────────────────┤
│ Super Admin URL:  http://admin.gpmh.local:5173           │
│ Village URL:      http://sonimoha.gpmh.local:5173        │
│ Backend API:      http://localhost:5000                  │
│ Prisma Studio:    http://localhost:5555                  │
├──────────────────────────────────────────────────────────┤
│ /etc/hosts entry:                                        │
│ 127.0.0.1 gpmh.local admin.gpmh.local sonimoha.gpmh.local│
└──────────────────────────────────────────────────────────┘
```
