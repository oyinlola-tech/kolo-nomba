# Environment Variables

This document describes all environment variables used by Kolo backend and frontend.

---

## Backend (kolo-backend/.env)

### Server

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `4000` | HTTP server port |
| `NODE_ENV` | No | `development` | Environment mode (`development`, `production`, `test`) |
| `LOG_LEVEL` | No | `info` | Pino log level (`fatal`, `error`, `warn`, `info`, `debug`) |

### Database

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string (`postgresql://user:pass@host:5432/db?schema=public`) |

### Authentication

| Variable | Required | Default | Description |
|---|---|---|---|
| `JWT_SECRET` | **Yes** | — | Secret for signing access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | **Yes** | — | Separate secret for refresh tokens (min 32 chars) |
| `COOKIE_SECRET` | **Yes** (prod) | — | Secret for signing cookies (separate from JWT) |

### CORS

| Variable | Required | Default | Description |
|---|---|---|---|
| `CORS_ORIGIN` | No | `http://localhost:5173,http://localhost:5174` | Comma-separated allowed origins (production must be explicit, no wildcard) |

### Rate Limiting

| Variable | Required | Default | Description |
|---|---|---|---|
| `RATE_LIMIT_MAX` | No | `100` | Global rate limit: max requests per time window |

### Cookie

| Variable | Required | Default | Description |
|---|---|---|---|
| `COOKIE_SECURE` | No | `true` | Whether cookies require HTTPS (`true` in production) |
| `COOKIE_SAME_SITE` | No | `Strict` | SameSite cookie attribute |
| `COOKIE_DOMAIN` | No | — | Cookie domain override (e.g., `.kolo.app`) |

### Nomba (Payment Provider)

| Variable | Required | Default | Description |
|---|---|---|---|
| `NOMBA_ENVIRONMENT` | **Yes** | — | `test` or `live` |
| `NOMBA_PARENT_ACCOUNT_ID` | **Yes** | — | Nomba parent account ID |
| `NOMBA_SUB_ACCOUNT_ID` | **Yes** | — | Nomba sub-account ID |
| `NOMBA_TEST_CLIENT_ID` | **Yes** | — | Test environment client ID |
| `NOMBA_TEST_PRIVATE_KEY` | **Yes** | — | Test environment private key |
| `NOMBA_LIVE_CLIENT_ID` | **Yes** | — | Live environment client ID |
| `NOMBA_LIVE_PRIVATE_KEY` | **Yes** | — | Live environment private key |
| `NOMBA_WEBHOOK_SECRET` | **Yes** | — | Webhook HMAC signature secret |
| `NOMBA_BASE_URL` | No | `https://api.nomba.com/v1` | Nomba API base URL |
| `NOMBA_WEBHOOK_URL` | No | — | Public webhook URL for Nomba callbacks |
| `NOMBA_TRANSFER_BASE_URL` | No | — | Nomba transfer API base URL (if different) |

### Super Admin Seed

| Variable | Required | Default | Description |
|---|---|---|---|
| `SUPER_ADMIN_EMAIL` | **Yes** | — | Email for the seeded super admin |
| `SUPER_ADMIN_PASSWORD` | **Yes** | — | Password for the seeded super admin |
| `SUPER_ADMIN_FIRST_NAME` | No | `System` | First name for super admin |
| `SUPER_ADMIN_LAST_NAME` | No | `Administrator` | Last name for super admin |

### Frontend URLs

| Variable | Required | Default | Description |
|---|---|---|---|
| `FRONTEND_URL` | No | `http://localhost:5173` | Main frontend URL |
| `ADMIN_FRONTEND_URL` | No | `http://localhost:5174` | Admin frontend URL (same domain as FRONTEND_URL if hosted together) |

### Redis (BullMQ)

| Variable | Required | Default | Description |
|---|---|---|---|
| `REDIS_HOST` | No | `localhost` | Redis server host |
| `REDIS_PORT` | No | `6379` | Redis server port |
| `REDIS_PASSWORD` | No | — | Redis password |
| `REDIS_DB` | No | `0` | Redis database index |
| `QUEUE_PREFIX` | No | `KOLO` | BullMQ queue name prefix |

### Background Jobs

| Variable | Required | Default | Description |
|---|---|---|---|
| `JOB_ATTEMPTS` | No | `3` | Max job retry attempts |
| `JOB_BACKOFF_DELAY` | No | `5000` | Delay between retries (ms) |
| `JOB_TIMEOUT` | No | `30000` | Job execution timeout (ms) |

### Email (SMTP)

| Variable | Required | Default | Description |
|---|---|---|---|
| `ENABLE_EMAIL_NOTIFICATIONS` | No | `true` | Enable email delivery |
| `SMTP_HOST` | No | `localhost` | SMTP server host |
| `SMTP_PORT` | No | `587` | SMTP server port |
| `SMTP_USER` | No | — | SMTP username |
| `SMTP_PASSWORD` | No | — | SMTP password (use app password for Gmail) |
| `SMTP_FROM_EMAIL` | No | `noreply@kolo.app` | Sender email address |
| `SMTP_FROM_NAME` | No | `Kolo` | Sender display name |
| `EMAIL_MAX_RETRIES` | No | `3` | Max email send attempts |
| `EMAIL_RETRY_DELAY` | No | `60000` | Delay between retries (ms) |

### SMS

| Variable | Required | Default | Description |
|---|---|---|---|
| `ENABLE_SMS_NOTIFICATIONS` | No | `false` | Enable SMS delivery |
| `SMS_PROVIDER` | No | — | SMS provider name |
| `SMS_API_KEY` | No | — | SMS API key |
| `SMS_API_SECRET` | No | — | SMS API secret |

### WhatsApp

| Variable | Required | Default | Description |
|---|---|---|---|
| `ENABLE_WHATSAPP_NOTIFICATIONS` | No | `false` | Enable WhatsApp delivery |
| `WHATSAPP_PROVIDER` | No | — | WhatsApp provider name |
| `WHATSAPP_API_KEY` | No | — | WhatsApp API key |

### Application Branding

| Variable | Required | Default | Description |
|---|---|---|---|
| `APP_NAME` | No | `Kolo` | Application display name |
| `APP_LOGO_URL` | No | — | Logo URL for email templates |
| `APP_FRONTEND_URL` | No | `http://localhost:5173` | Frontend URL for links in emails |
| `APP_SUPPORT_EMAIL` | No | `support@kolo.app` | Support email displayed to users |
| `APP_PRIVACY_URL` | No | `https://kolo.app/privacy` | Privacy policy URL |
| `APP_TERMS_URL` | No | `https://kolo.app/terms` | Terms of service URL |
| `PRIMARY_COLOR` | No | `#00A86B` | Brand primary color (hex) |
| `SECONDARY_COLOR` | No | `#1F2937` | Brand secondary color (hex) |

---

## Frontend (public/.env)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | No | `http://localhost:3000` | Backend API base URL (with /api/v1 prefix) |
| `VITE_APP_NAME` | No | `Kolo` | Application display name |

---

## Environment Examples

### Development (.env)

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kolo?schema=public
JWT_SECRET=dev-jwt-secret-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production
COOKIE_SECRET=dev-cookie-secret
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
NOMBA_ENVIRONMENT=test
NOMBA_TEST_CLIENT_ID=test_xxx
NOMBA_TEST_PRIVATE_KEY=test_key_xxx
NOMBA_WEBHOOK_SECRET=whsec_test
SUPER_ADMIN_EMAIL=admin@kolo.app
SUPER_ADMIN_PASSWORD=Admin123!
SMTP_HOST=localhost
SMTP_PORT=587
ENABLE_EMAIL_NOTIFICATIONS=false
```

### Production (.env)

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://user:password@prod-db-host:5432/kolo?schema=public
JWT_SECRET=<random-64-char-string>
JWT_REFRESH_SECRET=<random-64-char-string>
COOKIE_SECRET=<random-32-char-string>
CORS_ORIGIN=https://kolosavings.com
COOKIE_SECURE=true
COOKIE_SAME_SITE=Strict
COOKIE_DOMAIN=.kolosavings.com
NOMBA_ENVIRONMENT=live
NOMBA_LIVE_CLIENT_ID=live_xxx
NOMBA_LIVE_PRIVATE_KEY=live_key_xxx
NOMBA_WEBHOOK_SECRET=whsec_live_xxx
SUPER_ADMIN_EMAIL=admin@kolo.app
SUPER_ADMIN_PASSWORD=<secure-password>
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=<sendgrid-api-key>
ENABLE_EMAIL_NOTIFICATIONS=true
REDIS_HOST=redis-prod.internal
REDIS_PORT=6379
REDIS_PASSWORD=<redis-password>
```
