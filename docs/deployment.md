# Deployment

This document describes how to deploy Kolo to production, with specific guidance for Namecheap hosting.

---

## Prerequisites

- Node.js 20+ (LTS)
- PostgreSQL 15+
- Redis 7+
- PM2 or similar process manager
- Domain name with DNS configured
- SSL certificate (Let's Encrypt)

---

## Deployment Architecture

```mermaid
flowchart TB
    subgraph CDN["CDN / Load Balancer"]
        LB["Namecheap / Cloudflare\n(DNS + DDoS Protection)"]
    end

    subgraph Frontend["Frontend Layer"]
        Static["Static Assets\n(public/dist/)"]
        SPA["React SPA\n(Vite Build)"]
    end

    subgraph Backend["Application Layer"]
        API["Node.js Server\n(Fastify 5 via PM2)"]
        QueueW["BullMQ Workers\n(10+ queue processors)"]
    end

    subgraph Data["Data Layer"]
        PG[("PostgreSQL 15+\n(Prisma ORM)")]
        Redis[("Redis 7+\n(BullMQ + Cache)")]
    end

    subgraph External["External Services"]
        Nomba["Nomba API\n(Payment Gateway)"]
        SMTP["SMTP Server\n(Email)"]
    end

    User["Users"] --> LB
    LB --> Static
    LB --> API
    SPA --> Static
    API --> PG
    API --> Redis
    QueueW --> PG
    QueueW --> Redis
    API --> Nomba
    API --> SMTP
```

---

## Deployment Steps

### 1. Server Setup

```bash
# SSH into your server
ssh user@your-server.com

# Install Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Install Redis
sudo apt-get install -y redis-server

# Install PM2 globally
npm install -g pm2
```

### 2. Database Setup

```bash
# Create database
sudo -u postgres psql -c "CREATE DATABASE kolo;"
sudo -u postgres psql -c "CREATE USER kolo_user WITH PASSWORD 'secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE kolo TO kolo_user;"

# Update pg_hba.conf for password authentication
# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 3. Clone & Build

```bash
# Clone repository
git clone https://github.com/your-org/kolo.git
cd kolo

# Install backend dependencies
cd kolo-backend
npm install
npx prisma generate

# Build TypeScript
npm run build

# Install frontend dependencies
cd ../public
npm install

# Build frontend
npm run build
```

### 4. Configure Environment

```bash
# Create backend .env
cd ../kolo-backend
cp .env.example .env
nano .env  # Edit with production values
```

**Key production values:**
```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://kolo_user:password@localhost:5432/kolo?schema=public
JWT_SECRET=<generate-random-64-char-string>
JWT_REFRESH_SECRET=<generate-random-64-char-string>
COOKIE_SECRET=<generate-random-32-char-string>
CORS_ORIGIN=https://yourdomain.com
COOKIE_SECURE=true
COOKIE_SAME_SITE=Strict
```

### 5. Run Database Migrations

```bash
npx prisma migrate deploy
npm run prisma:seed  # Creates super admin
```

### 6. Start with PM2

```bash
# Start backend
pm2 start ecosystem.config.js

# Or start manually:
pm2 start npm --name "kolo-api" -- start

# Save PM2 process list
pm2 save
pm2 startup
```

### 7. Configure Nginx (Reverse Proxy)

```mermaid
flowchart TB
    subgraph DNS["DNS Layer"]
        API["api.kolosavings.com"]
        App["kolosavings.com"]
    end

    subgraph Nginx["Nginx Reverse Proxy"]
        APISS["API Server Block\n(443 SSL)"]
        AppSS["App Server Block\n(443 SSL)"]
        Redirect["HTTP → HTTPS\n(301 Redirect)"]
    end

    subgraph Backend["Backend"]
        APIProc["Node.js :4000\n(Fastify)"]
    end

    subgraph Frontend["Frontend"]
        Static["Static Files\n(public/dist/)"]
    end

    API --> APISS
    App --> AppSS
    API -->|"port 80"| Redirect
    App -->|"port 80"| Redirect
    Redirect --> APISS
    Redirect --> AppSS
    APISS --> APIProc
    AppSS --> Static
```

```nginx
server {
    listen 80;
    server_name api.kolosavings.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name api.kolosavings.com;

    ssl_certificate /etc/letsencrypt/live/api.kolosavings.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.kolosavings.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Frontend
server {
    listen 443 ssl;
    server_name kolosavings.com;

    ssl_certificate /etc/letsencrypt/live/kolosavings.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/kolosavings.com/privkey.pem;

    root /path/to/kolo/public/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header Content-Security-Policy "default-src 'self'; ...";
    add_header X-Frame-Options "DENY";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
}
```

### 8. Configure SSL (Let's Encrypt)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d kolosavings.com -d api.kolosavings.com
sudo certbot renew --dry-run
```

### 9. Set Up Webhook Endpoint

Ensure your Nomba webhook URL points to:
```
https://api.kolosavings.com/api/v1/webhooks/nomba
```

---

## Namecheap-Specific Guidance

### Shared Hosting (cPanel)

If using Namecheap shared hosting with Node.js support:

1. **Set up Node.js app** via cPanel's "Setup Node.js App" feature
2. **Document root**: Point to `kolo-backend/`
3. **Application startup file**: `src/server.ts`
4. **Passenger log**: Enable for debugging

### cPanel Steps

1. Upload code via Git or File Manager
2. In cPanel, go to "Setup Node.js App"
3. Create new app:
   - Node.js version: 20+
   - Application mode: Production
   - Application root: `/kolo-backend`
   - Application URL: `api.yourdomain.com`
   - Application startup file: `src/server.ts`
   - Environment variables: Set all env vars
4. Click "Run NPM Install"
5. Click "Create"

### VPS (Recommended)

1. Purchase a VPS from Namecheap (starts at ~$10/month)
2. Follow the standard deployment steps above
3. Use Cloudflare for DNS and DDoS protection

---

## Frontend Deployment

### Option 1: Same Server (Nginx)

Build and serve the static files from Nginx:

```bash
cd kolo-frontend
npm run build
# Output: dist/
```

Configure Nginx to serve `dist/` as shown above.

### Option 2: CDN (Vercel, Netlify)

```bash
# Build
npm run build

# Deploy to Vercel
npx vercel --prod

# Or Netlify
npx netlify deploy --prod
```

---

## Health Check

Kolo exposes a health check endpoint:

```
GET /api/v1/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-06-27T12:00:00.000Z"
}
```

Configure your monitoring system to check this endpoint every 30 seconds.

---

## Production Checklist

- [ ] All env vars configured with production values
- [ ] PostgreSQL connection is secure (password auth, non-default port)
- [ ] Redis has password configured
- [ ] CORS origins are explicit (no wildcard)
- [ ] JWT secrets are long random strings
- [ ] Cookie secure flags enabled
- [ ] HTTPS configured with valid SSL certificate
- [ ] Nginx/load balancer configured
- [ ] PM2 or supervisor configured for auto-restart
- [ ] Webhook URL registered with Nomba
- [ ] Monitoring/alerting configured
- [ ] Database backup schedule configured
- [ ] Log rotation configured
- [ ] SSL certificate auto-renewal configured
- [ ] Firewall configured (allow only 80, 443, 22)
- [ ] `npm audit --omit=dev` passes
