# ePanchayatRaj Village Platform – Hostinger VPS Deployment Guide

## Stack Overview
| Layer | Technology | Notes |
|---|---|---|
| Frontend | React 19 + Vite (built → served by nginx) | Multi-tenant SPA |
| Backend | Node.js 20 + Express + Prisma ORM | Host-header tenant resolution |
| Database | PostgreSQL 16 | Village, Citizen, Certificate, Subscription models |
| Cache | Redis 7 | Session / rate-limit |
| Gateway | Nginx (wildcard + custom-domain routing) | HTTP→HTTPS redirect, HSTS |
| Containerization | Docker + Docker Compose | 5 services |
| PDF Engine | Noto Devanagari fonts (in Docker image) | Marathi certificate PDFs |
| Custom Domains | Per-village CNAME/A + Let's Encrypt | `customDomain` field on Village |

## Architecture
```
Internet → Nginx Gateway (port 80/443)
              ├── admin.yourdomain.com          → SuperAdmin SPA + Backend API (/api/*)
              ├── superadmin.yourdomain.com     → SuperAdmin SPA + Backend API
              ├── *.yourdomain.com              → Village subdomain → SPA + API
              ├── yourdomain.com / www          → Landing Page (ePanchayatRaj marketing)
              └── village-custom-domain.in      → Custom domain → backend resolves via DB

Backend Tenant Resolution (tenant.js middleware):
  Host header → match subdomain on platform domain
               OR match customDomain field in villages table
               OR fallback to platform/unknown
```

## Key Application Features (know before deploying)
- **Multi-tenant**: each village gets `slug.yourdomain.com` subdomain + optional custom domain
- **Custom domains**: SuperAdmin sets a `customDomain` per village (e.g. `igatpuri.gov.in`); backend resolves via DB lookup on every request
- **Certificates**: 7 types (Birth, Death, Marriage, Residence, Income, Poverty, Character) — QR-code, Marathi PDF
- **Citizen portal**: self-registration, family management, application tracking, tax/water bill payment
- **Subscriptions**: per-village subscription with expiry and renewal reminders
- **SMTP**: configurable per-platform for transactional emails and bulk mail
- **Notices / Gramsabha / Financial Reports / Development Works** — all village-scoped
- **Complaint system**: image upload, tracking, admin resolution

---

## Prerequisites on Hostinger VPS

- **OS:** Ubuntu 22.04 LTS (recommended)
- **RAM:** Minimum 2 GB (4 GB recommended for production with custom domains)
- **Disk:** Minimum 20 GB SSD
- **Domain:** A primary domain with DNS access (e.g., `yourdomain.com`)
- **Hostinger VPS Access:** SSH root or sudo user
- **Custom domain awareness:** Each village using a custom domain must point their domain DNS to this VPS IP before you can issue an SSL cert for them

---

## Step 1 – Initial Server Setup

```bash
# Connect to your VPS
ssh root@YOUR_VPS_IP

# Update system packages
apt update && apt upgrade -y

# Install essential tools
apt install -y curl wget git ufw unzip net-tools htop

# Create a non-root deploy user (recommended)
adduser deploy
usermod -aG sudo deploy

# Copy your SSH key to deploy user
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy

# Switch to deploy user for all subsequent steps
su - deploy
```

---

## Step 2 – Install Docker & Docker Compose

```bash
# Remove old Docker versions if any
sudo apt remove -y docker docker-engine docker.io containerd runc

# Install Docker via official script
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add deploy user to docker group (no sudo needed for docker commands)
sudo usermod -aG docker $USER

# Apply group change (or logout and login again)
newgrp docker

# Verify Docker installation
docker --version
docker compose version
```

---

## Step 3 – Configure Firewall (UFW)

```bash
# Allow SSH (always do this first to avoid lockout)
sudo ufw allow OpenSSH

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Verify rules
sudo ufw status verbose
```

---

## Step 4 – DNS Configuration on Hostinger

### 4.1 Primary Platform Domain

Go to **Hostinger DNS Zone Editor** for your domain and add these records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `@` | `YOUR_VPS_IP` | 300 |
| A | `admin` | `YOUR_VPS_IP` | 300 |
| A | `superadmin` | `YOUR_VPS_IP` | 300 |
| A | `*` | `YOUR_VPS_IP` | 300 |
| CNAME | `www` | `yourdomain.com` | 300 |

> **Important:** The wildcard `*` record enables village subdomains like `igatpuri.yourdomain.com`, `kasara.yourdomain.com` to resolve to your VPS automatically — no manual DNS entry needed per village.

Wait for DNS propagation (up to 30 minutes). Verify with:
```bash
nslookup admin.yourdomain.com
nslookup test.yourdomain.com
```

### 4.2 Custom Domain DNS (Village-owned domain)

When a village wants to use their own domain (e.g., `igatpuri.gov.in`):

1. **Village/admin registers the domain** in their own DNS panel
2. They add an **A record** pointing to your VPS IP:
   ```
   Type: A
   Name: @  (or www, or the subdomain they want)
   Value: YOUR_VPS_IP
   TTL: 300
   ```
3. You (SuperAdmin) set the `customDomain` field via the SuperAdmin panel → Village → Domain Settings
4. You issue an SSL certificate for that domain (see Step 10)

> Custom domains bypass subdomain lookup entirely. The backend `tenant.js` middleware resolves them via `customDomain` DB column lookup on every request.

---

## Step 5 – Clone Repository on VPS

```bash
# Create app directory
sudo mkdir -p /opt/epanchayatraj
sudo chown deploy:deploy /opt/epanchayatraj

cd /opt/epanchayatraj

# Clone your repository (use your actual Git repo URL)
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git .

# Or upload via SCP from your local machine:
# scp -r /home/avi/Desktop/REACT-GPMH/village-platform deploy@YOUR_VPS_IP:/opt/epanchayatraj

cd /opt/epanchayatraj/village-platform
```

---

## Step 6 – Configure Production Environment Variables

### 6.1 Backend `.env`

```bash
# Generate strong random secrets
JWT_ACCESS=$(openssl rand -hex 64)
JWT_REFRESH=$(openssl rand -hex 64)
DB_PASS=$(openssl rand -hex 32)

echo "JWT_ACCESS_SECRET: $JWT_ACCESS"
echo "JWT_REFRESH_SECRET: $JWT_REFRESH"
echo "DB_PASS: $DB_PASS"
```

Edit the backend environment file:
```bash
nano /opt/epanchayatraj/village-platform/backend/.env
```

Replace content with:
```dotenv
DATABASE_URL="postgresql://gpmh_user:YOUR_STRONG_DB_PASSWORD@postgres:5432/gpmh_platform?schema=public"
REDIS_URL="redis://redis:6379"
JWT_ACCESS_SECRET="YOUR_GENERATED_ACCESS_SECRET_64_CHARS"
JWT_REFRESH_SECRET="YOUR_GENERATED_REFRESH_SECRET_64_CHARS"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"
PORT=5000
NODE_ENV=production
PLATFORM_DOMAIN="yourdomain.com"
SUPERADMIN_EMAIL="admin@yourdomain.com"
SUPERADMIN_PASSWORD="YourSecureAdminPassword@2024"
CORS_ORIGIN="https://yourdomain.com,https://admin.yourdomain.com"
```

> **`PLATFORM_DOMAIN`** is critical — it tells `tenant.js` which domain to strip to extract the subdomain. Custom-domain villages are resolved separately via DB lookup.

### 6.2 Frontend `.env`

```bash
nano /opt/epanchayatraj/village-platform/frontend/.env
```

Replace content with:
```dotenv
VITE_API_URL=https://admin.yourdomain.com
VITE_PLATFORM_DOMAIN=yourdomain.com
```

> **`VITE_PLATFORM_DOMAIN`** is baked into the frontend at build time. `TenantContext` uses it to distinguish platform subdomains from custom domains. Must match backend `PLATFORM_DOMAIN`.

---

## Step 7 – Update docker-compose.yml for Production

```bash
nano /opt/epanchayatraj/village-platform/docker-compose.yml
```

Replace the full content with the production version:

```yaml
services:
  # ─── PostgreSQL Database ─────────────────────────────────────
  postgres:
    image: postgres:16-alpine
    container_name: gpmh-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: gpmh_user
      POSTGRES_PASSWORD: YOUR_STRONG_DB_PASSWORD   # match DATABASE_URL above
      POSTGRES_DB: gpmh_platform
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U gpmh_user -d gpmh_platform"]
      interval: 5s
      timeout: 5s
      retries: 10

  # ─── Redis Cache ─────────────────────────────────────────────
  redis:
    image: redis:7-alpine
    container_name: gpmh-redis
    restart: unless-stopped
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 10

  # ─── Backend (Node.js + Express + Prisma) ────────────────────
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: gpmh-backend
    restart: unless-stopped
    env_file:
      - ./backend/.env
    environment:
      DATABASE_URL: "postgresql://gpmh_user:YOUR_STRONG_DB_PASSWORD@postgres:5432/gpmh_platform?schema=public"
      REDIS_URL: "redis://redis:6379"
    volumes:
      - backend_uploads:/app/uploads
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  # ─── Frontend (React + Vite → built → nginx) ────────────────
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_URL: "https://admin.yourdomain.com"
        VITE_PLATFORM_DOMAIN: "yourdomain.com"
    container_name: gpmh-frontend
    restart: unless-stopped

  # ─── Nginx Gateway (subdomain + custom domain routing) ────────
  gateway:
    image: nginx:alpine
    container_name: gpmh-gateway
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
      - ./nginx/custom-domains:/etc/nginx/conf.d/custom-domains:ro  # per-village custom domain configs
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - /var/www/certbot:/var/www/certbot:ro
      - backend_uploads:/app/uploads:ro
    depends_on:
      - backend
      - frontend

volumes:
  pgdata:
  redisdata:
  backend_uploads:
```

---

## Step 8 – Update Nginx Configuration for Production Domain

```bash
nano /opt/epanchayatraj/village-platform/nginx/default.conf
# Also create the custom-domains directory
mkdir -p /opt/epanchayatraj/village-platform/nginx/custom-domains
```

Replace `default.conf` with:
```nginx
# ─────────────────────────────────────────────────────────────
# Nginx Gateway – ePanchayatRaj Production
# Handles: bare domain, admin, superadmin, *.platform subdomains
# Custom village domains are in nginx/custom-domains/*.conf
# ─────────────────────────────────────────────────────────────

upstream backend  { server backend:5000; }
upstream frontend { server frontend:80;  }

# ─── Shared proxy settings snippet ──────────────────────────
# (used in all server blocks)
# Pass real client IP and original protocol to backend so
# tenant.js reads the correct Host header.

# ─── Redirect HTTP → HTTPS (platform domain + wildcard) ─────
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com admin.yourdomain.com superadmin.yourdomain.com *.yourdomain.com;

    # ACME challenge for Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# ─── HTTP catch-all (custom village domains before SSL is set up)
# Custom domains first hit HTTP. Redirect to HTTPS once cert exists.
# Until cert is ready, serve frontend via HTTP so ACME challenge works.
server {
    listen 80 default_server;
    server_name _;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Serve the app over HTTP temporarily (before cert is issued)
    # Once cert is issued, replace with a 301 redirect (see Step 10)
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    location /uploads/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        expires 7d;
    }
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# ─── Admin / SuperAdmin ──────────────────────────────────────
server {
    listen 443 ssl;
    http2 on;
    server_name admin.yourdomain.com superadmin.yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/admin.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.yourdomain.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;
    ssl_session_cache   shared:SSL:10m;
    ssl_session_timeout 10m;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;

    client_max_body_size 10M;

    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        expires 7d;
        add_header Cache-Control "public";
    }

    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}

# ─── Village Subdomains (*.yourdomain.com) ───────────────────
server {
    listen 443 ssl;
    http2 on;
    server_name *.yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;
    ssl_session_cache   shared:SSL:10m;
    ssl_session_timeout 10m;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-Content-Type-Options nosniff always;

    client_max_body_size 10M;

    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    location /uploads/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        expires 7d;
    }

    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}

# ─── Bare Domain / Landing Page (yourdomain.com) ─────────────
server {
    listen 443 ssl;
    http2 on;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    add_header Strict-Transport-Security "max-age=31536000" always;
    client_max_body_size 10M;

    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    location /uploads/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        expires 7d;
    }

    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}

# ─── Custom Village Domains ───────────────────────────────────
# Individual .conf files are included from the custom-domains/ directory.
# Each file is created when a new custom domain is configured.
# See Step 10 for the per-domain config template and workflow.
include /etc/nginx/conf.d/custom-domains/*.conf;
```

> **Replace `yourdomain.com`** with your actual domain name throughout this file.

---

## Step 9 – Obtain SSL Certificates (Let's Encrypt)

SSL requires DNS to be pointing at your VPS first (Step 4 must be complete).

### 9.1 Install Certbot on the VPS host

```bash
sudo apt install -y certbot

# Create webroot directory for ACME challenge
sudo mkdir -p /var/www/certbot

# Stop any system nginx if it occupies port 80
sudo systemctl stop nginx 2>/dev/null || true
```

### 9.2 Certificate for Bare Domain + www

```bash
sudo certbot certonly --standalone \
    -d yourdomain.com \
    -d www.yourdomain.com \
    --email your@email.com \
    --agree-tos \
    --no-eff-email
```

### 9.3 Certificate for Admin / SuperAdmin Subdomains

```bash
sudo certbot certonly --standalone \
    -d admin.yourdomain.com \
    -d superadmin.yourdomain.com \
    --email your@email.com \
    --agree-tos \
    --no-eff-email
```

### 9.4 Wildcard Certificate (covers all village subdomains)

Wildcard certs require DNS-01 challenge. Use Hostinger DNS plugin or manual challenge:

```bash
sudo certbot certonly --manual \
    --preferred-challenges dns \
    -d "*.yourdomain.com" \
    -d yourdomain.com \
    --email your@email.com \
    --agree-tos \
    --no-eff-email
```

When prompted, add the `_acme-challenge` TXT record in Hostinger DNS panel, wait 30–60 seconds, then press Enter to verify.

> **Note:** The wildcard cert covers `*.yourdomain.com` — this handles all village subdomain HTTPS automatically. You do **not** need a separate cert per village subdomain. Custom domains need separate certs (Step 10).

### 9.5 Set Up Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Add cron job for auto-renewal
sudo crontab -e
# Add this line:
0 3 * * * certbot renew --quiet && docker exec gpmh-gateway nginx -s reload
```

---

---

## Step 10 – Custom Domain Setup (Per Village)

This is required whenever a village is assigned a custom domain (e.g., `igatpuri.gov.in`) in the SuperAdmin panel.

### How It Works

```
Village's domain (igatpuri.gov.in)
  → A record → YOUR_VPS_IP
  → Nginx catches it in the HTTP catch-all default_server
  → Backend tenant.js middleware → prisma.village.findFirst({ where: { customDomain: hostname } })
  → Resolves to the correct village and serves its data
```

### 10.1 Pre-requisites for Each Custom Domain

1. Village DNS A record pointing to your VPS IP ✓  
2. `customDomain` field set in SuperAdmin → Village Settings  
3. SSL certificate issued for the custom domain (below)  
4. Nginx config added for the custom domain (below)  

### 10.2 Issue SSL Certificate for a Custom Domain

```bash
# Stop the gateway temporarily to free port 80
docker compose stop gateway

# Issue cert for the village's custom domain
sudo certbot certonly --standalone \
    -d igatpuri.gov.in \
    --email your@email.com \
    --agree-tos \
    --no-eff-email

# Restart gateway
docker compose start gateway
```

### 10.3 Create Nginx Config for the Custom Domain

Create a per-domain config file in the `custom-domains/` directory:

```bash
nano /opt/epanchayatraj/village-platform/nginx/custom-domains/igatpuri.gov.in.conf
```

Template content (replace `igatpuri.gov.in` with the actual domain):

```nginx
# ─── Custom domain: igatpuri.gov.in ──────────────────────────
server {
    listen 443 ssl;
    http2 on;
    server_name igatpuri.gov.in www.igatpuri.gov.in;

    ssl_certificate     /etc/letsencrypt/live/igatpuri.gov.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/igatpuri.gov.in/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;
    ssl_session_cache   shared:SSL:10m;
    ssl_session_timeout 10m;

    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options SAMEORIGIN always;
    add_header X-Content-Type-Options nosniff always;

    client_max_body_size 10M;

    # API → backend (tenant resolved from Host header)
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;          # CRITICAL: backend reads Host to resolve tenant
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    location /uploads/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        expires 7d;
        add_header Cache-Control "public";
    }

    # Frontend SPA (TenantContext detects non-platform host → custom domain flow)
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

> **The `Host` header must be passed as-is** to the backend. This is what `tenant.js` reads to perform the `customDomain` DB lookup.

### 10.4 Reload Nginx to Apply the New Config

```bash
# Test config for syntax errors
docker exec gpmh-gateway nginx -t

# Reload without downtime
docker exec gpmh-gateway nginx -s reload
```

### 10.5 Also Update the HTTP→HTTPS Redirect for the Custom Domain

Add to the HTTP catch-all default_server block (or create a separate per-domain HTTP block) so the plain HTTP version also redirects:

```nginx
# Add to nginx/custom-domains/igatpuri.gov.in.conf (append after the 443 block)
server {
    listen 80;
    server_name igatpuri.gov.in www.igatpuri.gov.in;
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { return 301 https://$host$request_uri; }
}
```

### 10.6 Auto-renewal for Custom Domain Certs

The cron job from Step 9.5 handles all certs including custom domains:
```bash
0 3 * * * certbot renew --quiet && docker exec gpmh-gateway nginx -s reload
```

### Custom Domain Checklist

- [ ] Village DNS A record → VPS IP (village admin's responsibility)
- [ ] `customDomain` field set in SuperAdmin panel
- [ ] `certbot certonly` run for the custom domain
- [ ] `nginx/custom-domains/domain.conf` file created
- [ ] `nginx -t && nginx -s reload` run
- [ ] HTTPS verified: `curl -I https://igatpuri.gov.in`

---

## Step 11 – Build and Deploy with Docker Compose

```bash
cd /opt/epanchayatraj/village-platform

# Build all images (first time takes 5–10 minutes)
# Backend image installs Noto Devanagari fonts for Marathi PDF generation
docker compose build --no-cache

# Start all services in detached mode
docker compose up -d

# Watch startup logs
docker compose logs -f
```

### Verify all containers are running:
```bash
docker compose ps
```

Expected output:
```
NAME              STATUS          PORTS
gpmh-postgres     running (healthy)
gpmh-redis        running (healthy)
gpmh-backend      running
gpmh-frontend     running
gpmh-gateway      running         0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

---

## Step 12 – Database Initialization

The backend Dockerfile's CMD automatically runs `prisma db push` and seeds the database on first start:
```
CMD ["sh", "-c", "npx prisma db push --skip-generate --accept-data-loss && node prisma/seed-all.js && node src/server.js"]
```

Verify it completed:

```bash
# Check backend logs for migration/seed output
docker compose logs backend | head -100
```

You should see output like:
```
✓ All migrations applied
✓ Seed completed successfully
```

The seed creates:
- SuperAdmin account (credentials from `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD` in `.env`)
- Tehsil/district data for Maharashtra
- Default global platform settings

If you need to run seeds manually:
```bash
# Run database seed manually
docker exec gpmh-backend node prisma/seed-all.js

# Access Prisma Studio (optional, for debugging)
docker exec -it gpmh-backend npx prisma studio
```

---

## Step 13 – Verify Deployment

```bash
# Test bare domain (should show ePanchayatRaj landing page)
curl -I https://yourdomain.com

# Test API health
curl https://admin.yourdomain.com/api/health

# Test village subdomain (returns village JSON if seeded)
curl https://igatpuri.yourdomain.com/api/public/village

# Test custom domain resolution (if a custom domain is configured)
curl -H "Host: igatpuri.gov.in" http://localhost/api/public/village

# Check backend logs for errors
docker compose logs backend --tail=50

# Check gateway logs
docker compose logs gateway --tail=50
```

---

## Step 14 – Set Up systemd Service (Auto-start on Reboot)

```bash
sudo nano /etc/systemd/system/epanchayatraj.service
```

Paste:
```ini
[Unit]
Description=ePanchayatRaj Village Platform
Requires=docker.service
After=docker.service network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/epanchayatraj/village-platform
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=300
User=deploy

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable epanchayatraj
sudo systemctl start epanchayatraj
sudo systemctl status epanchayatraj
```

---

## Step 15 – First Login & Platform Configuration

Open your browser and navigate to:
```
https://admin.yourdomain.com
```

Use the superadmin credentials set in `backend/.env`:
```
Email:    admin@yourdomain.com
Password: YourSecureAdminPassword@2024
```

> **Change the admin password immediately after first login.**

### Post-login SuperAdmin setup checklist:

1. **Change password** (Account Settings)
2. **Configure SMTP** (Settings → SMTP Configuration) — required for OTP emails, bulk mail, renewal reminders
3. **Create Tehsils** if not already seeded (Settings → Tehsils)
4. **Create first Village** (Villages → New Village)
   - Set `slug` (used as subdomain: `slug.yourdomain.com`)
   - Set `subdomain` (same as slug usually)
   - Optionally set `customDomain` if the village has their own domain
   - Set admin email + password for the village admin account
5. **Access village admin** at `https://slug.yourdomain.com` or `https://custom-domain.in`
6. **Set village SEO** (Villages → [village] → SEO) for OpenGraph / meta tags
7. **Manage subscriptions** (Subscriptions) — set expiry dates, send renewal reminders

### Setting a Custom Domain for a Village

In the SuperAdmin panel → Villages → [Village Name] → Domain Settings:

```
Subdomain: igatpuri         → serves https://igatpuri.yourdomain.com
Custom Domain: igatpuri.gov.in  → serves https://igatpuri.gov.in
```

After saving the custom domain in the panel, complete the steps in **Step 10** (SSL cert + nginx config).

---

## Deployment via Git (Updates / Redeploy)

After pushing code changes to your repository:

```bash
cd /opt/epanchayatraj/village-platform

# Pull latest code
git pull origin main

# Rebuild and restart changed services
docker compose up -d --build

# Or rebuild specific service
docker compose up -d --build backend
docker compose up -d --build frontend
```

> **Adding a new Prisma migration:** The backend `CMD` runs `prisma db push` on every container start, so schema changes are applied automatically on rebuild.

---

## Useful Docker Commands

```bash
# View all container logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend
docker compose logs -f gateway

# Restart a specific service
docker compose restart backend

# Stop all services
docker compose down

# Stop and remove volumes (DANGEROUS – deletes database!)
docker compose down -v

# Check resource usage
docker stats

# Access backend shell
docker exec -it gpmh-backend sh

# Access PostgreSQL shell
docker exec -it gpmh-postgres psql -U gpmh_user -d gpmh_platform

# Access Redis shell
docker exec -it gpmh-redis redis-cli

# View backend uploads
docker exec gpmh-backend ls -la /app/uploads/certificates/
```

---

## Backup & Restore

### Backup PostgreSQL Database

The database contains all village data, citizen records, certificates, complaints, subscriptions, financial reports, and audit logs.

```bash
sudo mkdir -p /opt/epanchayatraj/backups

# Create backup
docker exec gpmh-postgres pg_dump -U gpmh_user gpmh_platform > \
    /opt/epanchayatraj/backups/gpmh_$(date +%Y%m%d_%H%M%S).sql

# Schedule daily backups (add to crontab)
0 2 * * * docker exec gpmh-postgres pg_dump -U gpmh_user gpmh_platform \
    > /opt/epanchayatraj/backups/gpmh_$(date +\%Y\%m\%d).sql && \
    find /opt/epanchayatraj/backups -name "*.sql" -mtime +7 -delete
```

### Backup Uploads

The uploads volume contains generated certificate PDFs, complaint images, gallery photos, and tax-payment screenshots.

```bash
docker run --rm -v village-platform_backend_uploads:/data \
    -v /opt/epanchayatraj/backups:/backup \
    alpine tar czf /backup/uploads_$(date +%Y%m%d).tar.gz -C /data .
```

### Restore Database

```bash
cat /opt/epanchayatraj/backups/gpmh_YYYYMMDD.sql | \
    docker exec -i gpmh-postgres psql -U gpmh_user gpmh_platform
```

---

## Troubleshooting

### Container fails to start
```bash
docker compose logs backend
docker compose logs gateway
```

### 502 Bad Gateway
- Backend container not healthy: `docker compose ps`
- Wait for healthcheck: `docker compose logs postgres`
- Check DATABASE_URL in docker-compose.yml matches postgres password

### SSL Certificate errors
```bash
# Check cert expiry
sudo certbot certificates
# Renew manually
sudo certbot renew
docker exec gpmh-gateway nginx -s reload
```

### DNS not resolving subdomains
```bash
# Check DNS propagation
nslookup igatpuri.yourdomain.com 8.8.8.8
dig +short igatpuri.yourdomain.com
```

### Uploads not serving
```bash
# Check volume mount
docker compose exec gateway ls /app/uploads
# If empty, the gateway needs backend_uploads volume mounted
docker compose down && docker compose up -d
```

### Custom domain returns 502 / wrong village
```bash
# Verify the DB has the correct customDomain value
docker exec gpmh-postgres psql -U gpmh_user gpmh_platform \
    -c "SELECT name, subdomain, custom_domain FROM villages;"

# Verify nginx is passing Host header (not rewriting it)
# In nginx config, make sure proxy_set_header Host $host; is present
# (NOT proxy_set_header Host backend; which breaks tenant resolution)

# Test tenant resolution directly
curl -H "Host: igatpuri.gov.in" http://localhost/api/public/village
```

### Custom domain HTTPS cert not found
```bash
# Check available certs
sudo certbot certificates

# Re-issue if missing (stop gateway first)
docker compose stop gateway
sudo certbot certonly --standalone -d custom-domain.in --email you@email.com --agree-tos
docker compose start gateway
docker exec gpmh-gateway nginx -s reload
```

### nginx config errors after adding custom domain
```bash
# Test config before reloading
docker exec gpmh-gateway nginx -t
# Read the error — usually a missing semicolon or wrong cert path
```

### Port 80 already in use
```bash
sudo systemctl stop nginx apache2 2>/dev/null || true
sudo lsof -i :80
sudo kill -9 <PID>
docker compose up -d gateway
```

---

## Security Checklist

- [ ] Changed default `SUPERADMIN_PASSWORD` in `.env`
- [ ] Generated unique 64-char `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`
- [ ] Set strong PostgreSQL password `POSTGRES_PASSWORD`
- [ ] SSL certificates installed and HTTPS enforced for all domains
- [ ] UFW firewall enabled (only 22, 80, 443 open)
- [ ] No ports 5000, 5432, 5433, 6379 exposed publicly (remove from docker-compose ports)
- [ ] `NODE_ENV=production` set in backend env
- [ ] Database port 5433 removed from compose (internal only)
- [ ] `proxy_set_header Host $host;` present in all nginx proxy blocks (critical for tenant resolution)
- [ ] Custom domain certs issued and nginx configs created for all active custom domains
- [ ] SMTP configured in SuperAdmin panel (without it, OTP and renewal reminder emails fail silently)
- [ ] Village subscriptions created with correct expiry dates
- [ ] Regular backups scheduled (DB + uploads volume)
- [ ] Test custom domain tenant resolution with `curl -H "Host: ..." http://localhost/api/public/village`

---

## File Structure Summary

```
/opt/epanchayatraj/village-platform/
├── docker-compose.yml               ← Main orchestration (5 services)
├── backend/
│   ├── .env                         ← Backend secrets (never commit)
│   ├── Dockerfile                   ← Installs Noto Devanagari fonts
│   ├── prisma/
│   │   ├── schema.prisma            ← Village, User, Certificate, Subscription models
│   │   └── seed-all.js              ← Seeds superadmin + tehsils + default settings
│   └── src/
│       ├── middleware/tenant.js     ← Host header → subdomain OR customDomain DB lookup
│       ├── routes/
│       │   ├── public.routes.js     ← Unauthenticated village data endpoints
│       │   ├── village.admin.routes.js
│       │   ├── superadmin.routes.js
│       │   └── citizen.routes.js
│       └── services/village.service.js ← customDomain uniqueness validation
├── frontend/
│   ├── .env                         ← VITE_PLATFORM_DOMAIN (baked at build time)
│   ├── Dockerfile
│   └── src/
│       └── context/TenantContext.tsx ← Detects subdomain vs custom domain vs landing
├── nginx/
│   ├── default.conf                 ← Platform domain + HTTP catch-all routing
│   └── custom-domains/              ← Per-village custom domain configs
│       ├── igatpuri.gov.in.conf     ← (example – create per custom domain)
│       └── kasara.gov.in.conf
└── deployment_guide.md
```

---

*Updated for ePanchayatRaj Village Platform – custom domain support, subscription system, Marathi PDF engine – April 2026*
