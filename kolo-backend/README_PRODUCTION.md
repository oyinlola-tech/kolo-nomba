# Kolo Backend — Production Deployment Guide

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- A Nomba business account (API keys)

## Environment Variables

Create a `.env` file in the `kolo-backend/` directory:

```env
# Required
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/kolo
JWT_SECRET=<random-64-char-string>
JWT_REFRESH_SECRET=<random-64-char-string>
NOMBA_API_KEY=your_nomba_api_key
NOMBA_SECRET_KEY=your_nomba_secret_key
SUPER_ADMIN_EMAIL=admin@kolo.com
SUPER_ADMIN_PASSWORD=<strong-password>

# Optional
CORS_ORIGIN=*
RATE_LIMIT_MAX=100
LOG_LEVEL=info
NOMBA_ACCOUNT_ID=
NOMBA_WEBHOOK_SECRET=
NOMBA_BASE_URL=https://api.nomba.com/v1
```

## Installation

```bash
cd kolo-backend
npm install
```

## Database Setup

```bash
# Run migrations
npm run prisma:migrate:prod

# Seed super admin account
npm run prisma:seed

# Or both in one command
npm run db:setup
```

The seed script creates:
1. A SUPER_ADMIN user using `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD`
2. A platform wallet for revenue collection

Running seed multiple times is safe — it uses `upsert`.

## Build & Start

```bash
# Type-check
npm run build

# Production start
npm run start:prod
```

The server listens on the port specified by `PORT` (default 3000).

## API Documentation

- Swagger UI: `/docs` (development only)
- Health check: `GET /api/v1/health`

## Super Admin Access

Super admin accounts are **only** created through the seed script.
There is no public registration endpoint for super admin.

Log in via `POST /api/v1/auth/login` using the seeded credentials.
All admin endpoints are under `GET /api/v1/admin/*` and require `SUPER_ADMIN` role.

## Security

- Helmet security headers enabled
- CORS restricted (configurable via `CORS_ORIGIN`)
- Rate limiting applied (configurable via `RATE_LIMIT_MAX`)
- Request body limited to 1MB
- Passwords hashed with Argon2
- JWT access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Audit logging for all financial and auth events

## Database Backup

### Backup

```bash
pg_dump "postgresql://user:password@localhost:5432/kolo" > kolo-backup-$(date +%Y%m%d).sql
```

### Restore

```bash
psql "postgresql://user:password@localhost:5432/kolo" < kolo-backup-20260101.sql
```

### Critical Data

- Users, Groups, Memberships
- Contribution plans, cycles, member contributions
- Payments, transactions, ledger entries
- Wallets and balances
- Payouts and withdrawals
- Audit logs

## Monitoring

- Health endpoint: `GET /api/v1/health` (returns status, DB connection, uptime)
- Application logs via Pino (JSON structured logging)
- Audit logs stored in the database

## Troubleshooting

| Issue | Check |
|---|---|
| Server won't start | All required env vars are set? PostgreSQL running? |
| Migration fails | DATABASE_URL correct? PostgreSQL user has permissions? |
| Seed fails | SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD set? |
| Auth fails | JWT_SECRET and JWT_REFRESH_SECRET set? |
| Payments fail | NOMBA_API_KEY and NOMBA_SECRET_KEY valid? |

## Deployment (Namecheap)

1. Upload all files (excluding `node_modules`, `.env`)
2. SSH into server
3. Run `npm install`
4. Set environment variables
5. Run `npm run db:setup`
6. Run `npm run build`
7. Start with `npm run start:prod`
8. Use a process manager (e.g., PM2) for auto-restart:

```bash
npm install -g pm2
pm2 start npm --name "kolo-api" -- run start:prod
pm2 save
pm2 startup
```
