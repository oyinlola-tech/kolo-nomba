# Kolo

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Fintech-success"/>
  <img src="https://img.shields.io/badge/Backend-Fastify%205-blue"/>
  <img src="https://img.shields.io/badge/Frontend-React%2018-61DAFB"/>
  <img src="https://img.shields.io/badge/Database-PostgreSQL-4169E1"/>
  <img src="https://img.shields.io/badge/Queue-BullMQ%20%2B%20Redis-DC382D"/>
  <img src="https://img.shields.io/badge/Payments-Nomba-green"/>
  <img src="https://img.shields.io/badge/Auth-JWT%20%2B%20Argon2-purple"/>
</p>

<p align="center">
  <strong>Digital Infrastructure for African Cooperative Savings and Payments</strong>
</p>

---

## About Kolo

Kolo digitizes traditional African savings systems — **Ajo**, **Esusu**, **thrift contributions**, and **cooperative savings groups** — by providing modern financial infrastructure for community-based savings.

Millions of people across Africa rely on informal savings systems, yet most groups still manage contributions manually with notebooks, spreadsheets, and messaging apps. Kolo bridges this gap with:

- Transparent contribution tracking via double-entry ledger
- Automated payment collection through Nomba payment gateway
- Secure, automated payouts with approval workflows
- Real-time notifications across email and in-app channels
- Role-based dashboards for members, group admins, and platform operators

---

## System Architecture

```mermaid
flowchart TB
    subgraph Frontend["Frontend (React SPA)"]
        Landing["Landing Pages\n/, /pricing, /about"]
        Auth["Auth Pages\n/login, /register, /verify-otp"]
        Member["Member Dashboard\n/member/*"]
        GroupAdmin["Group Admin\n/group/admin/*"]
        SuperAdmin["Super Admin\n/ajo/admin/*"]
    end

    subgraph Backend["Backend (Fastify 5)"]
        Router["Route Registry\n/api/v1/*"]
        Middleware["CORS → Helmet → RateLimit\n→ Auth → Role → Group"]
        Controllers["17 Controllers"]
        Services["30+ Business Services"]
        Repositories["31 Prisma Repositories"]
    end

    subgraph Infrastructure["Infrastructure"]
        PG[("PostgreSQL 15+\n(Prisma ORM)")]
        Redis[("Redis 7+\n(BullMQ + Token Cache)")]
        Jobs["Background Jobs\n14 queues, 20+ processors"]
    end

    subgraph External["External Integrations"]
        Nomba["Nomba API\n(Payment Gateway)"]
        Email["SMTP / Nodemailer\n(Transactional Email)"]
    end

    Frontend -->|HTTPS withCredentials| Router
    Router --> Middleware
    Middleware --> Controllers
    Controllers --> Services
    Services --> Repositories
    Services --> Jobs
    Repositories --> PG
    Jobs --> Redis
    Services --> Nomba
    Services --> Email
    Nomba -->|Webhooks| Router
```

---

## How Kolo Works

```mermaid
sequenceDiagram
    participant Member
    participant Frontend
    participant API as Fastify API
    participant Nomba
    participant Queue as BullMQ
    participant DB as PostgreSQL

    Member->>Frontend: Joins savings group
    Frontend->>API: Create/join group
    API->>DB: Store membership

    Note over Frontend,DB: Group admin creates contribution plan

    Member->>Frontend: Make contribution payment
    Frontend->>API: initiatePayment()
    API->>DB: Create Payment (INITIALIZED)
    API->>Nomba: Initiate payment
    Nomba-->>API: paymentUrl
    API-->>Frontend: Redirect URL
    Member->>Nomba: Complete payment

    Nomba->>API: Webhook (HMAC signed)
    API->>API: Verify HMAC signature
    API->>DB: Store WebhookEvent
    API->>Queue: Enqueue verification job

    Queue->>API: ProcessWebhookProcessor
    API->>Nomba: verifyPayment()
    Nomba-->>API: Confirmed

    API->>DB: $transaction
    API->>DB: Update Payment → SUCCESSFUL
    API->>DB: Atomic credit group wallet
    API->>DB: Create ledger entries
    API->>DB: Update contribution → PAID
    API->>Member: Email notification

    Frontend->>API: Poll/realtime update
    API-->>Frontend: Updated dashboard
```

---

## Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React 18** + TypeScript | UI framework |
| **Vite 6** | Build tool and dev server |
| **Tailwind CSS 4** + shadcn/ui | Design system and styling |
| **TanStack Query 5** | Server state management and caching |
| **Zustand 5** | Client state (auth, theme, UI) |
| **React Router 6** | SPA routing |
| **React Hook Form** + **Zod 4** | Form validation |
| **Axios** | HTTP client with token refresh interceptor |
| **Recharts** | Data visualization and charts |

### Backend

| Technology | Purpose |
|---|---|
| **Node.js** + **TypeScript** | Runtime |
| **Fastify 5** | HTTP server framework |
| **Prisma 7** | ORM with type-safe queries |
| **PostgreSQL 15+** | Primary data store |
| **Redis 7+** | BullMQ queue + token cache |
| **BullMQ 5** | Background job processing (14 queues) |
| **JWT (jose)** + **Argon2** | Authentication and password hashing |
| **Pino 10** | Structured JSON logging |
| **Zod 4** | Request validation |
| **Nodemailer** | Email delivery |

### External Services

| Service | Purpose |
|---|---|
| **Nomba API** | Payment initiation, verification, transfers, virtual accounts |
| **SMTP** | Transactional email delivery |

---

## Features

### Cooperative Management
- Create and manage savings groups (Ajo/Esusu)
- Member invitations and role management (OWNER, ADMIN, MEMBER)
- Contribution plans with daily/weekly/monthly cycles
- Automated cycle generation and overdue tracking

### Payment Infrastructure
- Payment initiation via Nomba (card, bank transfer, Nomba wallet)
- Bank transfer via Nomba virtual accounts
- Server-side payment verification via HMAC-signed webhooks
- Duplicate webhook detection and idempotent processing
- Atomic wallet operations with double-entry ledger

### Payout System
- Manual, rotation, and custom payout types
- Multi-step approval workflows
- Scheduled recurring payouts
- Automatic retry with exponential backoff (max 3 attempts)
- Wallet balance reversion on terminal failure

### Security
- JWT access tokens (15 min, in-memory only)
- HttpOnly refresh cookies (7 day, SameSite=Strict)
- Argon2 password hashing
- SHA-256 hashed refresh tokens in database
- Device fingerprinting with OTP challenge for unknown devices
- OTP attempt lockout (3 strikes, 15 min cooldown)
- Rate limiting (global + per-route)
- Helmet security headers + CORS with explicit origins
- Audit logging for all sensitive operations

### Notifications
- Multi-channel delivery (in-app + email)
- Event-driven via in-process EventBus
- 30+ event types across auth, groups, contributions, payments, payouts, security
- Delivery tracking with retry logic
- Per-user notification preferences

### Admin Dashboard
- **Super Admin**: Platform metrics, user management, revenue analytics, security monitoring, reconciliation
- **Group Admin**: Member management, contribution tracking, payout approval, reports
- **Member**: Savings progress, payment history, notification center

---

## Project Structure

```
kolo/
├── kolo-backend/                    # Fastify API server
│   ├── prisma/                      # Schema, migrations, seed
│   │   └── schema.prisma            # 25 models, 30+ enums
│   ├── src/
│   │   ├── config/                  # App, env, DB, Nomba config
│   │   ├── constants/               # Roles, error codes, payment
│   │   ├── controllers/             # 17 HTTP handlers
│   │   ├── database/                # Prisma + Redis singletons
│   │   ├── dto/                     # Data transfer objects
│   │   ├── errors/                  # Custom error classes
│   │   ├── events/                  # EventBus + handlers
│   │   ├── integrations/            # Nomba, email, SMS, WhatsApp
│   │   ├── interfaces/              # TypeScript interfaces
│   │   ├── jobs/                    # BullMQ queues, workers, scheduler
│   │   │   ├── processors/          # 10 processor files
│   │   │   ├── queue-manager.ts     # Singleton queue factory
│   │   │   ├── scheduler.ts         # Cron job registration
│   │   │   └── background-job.repository.ts
│   │   ├── loaders/                 # App bootstrap (7 loaders)
│   │   ├── logger/                  # Pino-based structured logging
│   │   │   ├── core/                # Base Logger class
│   │   │   ├── implementations/     # Domain-specific loggers
│   │   │   └── transports/          # Console, file, DB
│   │   ├── middleware/              # Auth, Role, Group, RateLimit, Error
│   │   ├── repositories/           # 31 Prisma data access classes
│   │   ├── routes/                  # 17 route definitions
│   │   ├── services/               # 30+ business logic classes
│   │   ├── utils/                  # JWT, hash, encryption, pagination
│   │   └── validators/             # 16 Zod schemas
│   ├── .env.example
│   └── package.json
│
├── public/                          # React frontend
│   ├── src/
│   │   ├── api/                     # Axios client with auth interceptor
│   │   ├── app/                     # Router, providers, Zustand store
│   │   ├── components/              # Shared UI + shadcn/ui primitives
│   │   ├── features/                # Feature-based modules
│   │   │   ├── auth/                # Login, register, OTP, password reset
│   │   │   ├── landing/             # Public marketing pages
│   │   │   ├── admin/               # Super Admin (14 pages)
│   │   │   ├── group/               # Group Admin (10 pages)
│   │   │   └── member/              # Member dashboard (9 pages)
│   │   ├── hooks/                   # TanStack Query hooks (15 files)
│   │   ├── services/               # API service functions (13 files)
│   │   ├── types/                   # TypeScript type definitions
│   │   └── utils/                   # Formatting utilities
│   ├── .env
│   └── package.json
│
├── docs/                            # Engineering documentation
│   ├── architecture.md              # System architecture with Mermaid
│   ├── authentication.md            # Auth flows with sequence diagrams
│   ├── database-design.md           # ER diagram + model documentation
│   ├── webhook-flow.md              # Webhook processing pipeline
│   ├── queue-system.md              # BullMQ architecture and jobs
│   ├── notification-system.md       # Event-driven notification system
│   ├── payment-flow.md              # Payment lifecycle with state diagrams
│   ├── nomba-integration.md         # Nomba API integration details
│   ├── payout-flow.md               # Payout lifecycle and transfers
│   ├── deployment.md                # Production deployment guide
│   └── ...                          # (22 total documentation files)
│
├── README.md
├── LICENSE.md
└── SECURITY.md
```

---

## Documentation

All engineering documentation is in the `docs/` directory and uses **Mermaid diagrams** to represent actual code relationships:

| Document | Description | Key Diagrams |
|---|---|---|
| `docs/architecture.md` | System architecture overview | Flowchart, sequence, job architecture |
| `docs/authentication.md` | Registration, login, OTP, token mgmt | 5 sequence + flowchart diagrams |
| `docs/database-design.md` | 25 models, relationships, ledger | ER diagram (20+ relations) |
| `docs/webhook-flow.md` | Nomba webhook verification & processing | Pipeline flowchart + sequence diagram |
| `docs/queue-system.md` | BullMQ queues, workers, schedules | Architecture + state diagrams |
| `docs/notification-system.md` | EventBus, channels, templates | Architecture + ER diagrams |
| `docs/payment-flow.md` | Payment lifecycle, fee engine | State + sequence diagrams |
| `docs/nomba-integration.md` | Payment gateway integration | 7 flowcharts + sequence diagrams |
| `docs/payout-flow.md` | Payout lifecycle, transfers | State + sequence diagrams |
| `docs/security-architecture.md` | Security layers, auth, audit | 5 flowchart + sequence diagrams |
| `docs/deployment.md` | Production deployment steps | Architecture + Nginx flow diagrams |
| `docs/frontend-architecture.md` | React app structure, data flow | 6 architecture diagrams |
| `docs/api-endpoints.md` | Complete API reference | (495 lines) |
| `docs/environment.md` | Environment variables | (206 lines) |

---

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+

### Backend Setup

```bash
cd kolo-backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database URL, JWT secrets, Nomba keys

# Run database migrations and seed super admin
npm run prisma:migrate:prod
npm run prisma:seed

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd public
npm install

# Configure environment
# Edit public/.env with your API URL

# Start development server
npm run dev
```

### Environment Variables

Required variables (see `docs/environment.md` for full list):

```env
# Backend (kolo-backend/.env)
DATABASE_URL=postgresql://user:password@localhost:5432/kolo
JWT_SECRET=<random-64-char-string>
JWT_REFRESH_SECRET=<random-64-char-string>
NOMBA_PARENT_ACCOUNT_ID=<nomba-account-id>
NOMBA_SUB_ACCOUNT_ID=<nomba-sub-account-id>
NOMBA_TEST_CLIENT_ID=<nomba-test-client-id>
NOMBA_TEST_PRIVATE_KEY=<nomba-test-private-key>
SUPER_ADMIN_EMAIL=admin@kolo.com
SUPER_ADMIN_PASSWORD=<strong-password>

# Frontend (public/.env)
VITE_API_URL=http://localhost:4000
```

---

## Security

```mermaid
flowchart LR
    L1["1. Transport Security\nHTTPS, Helmet, CORS"]
    L2["2. Rate Limiting\nglobal + per-route"]
    L3["3. Input Validation\nZod on all endpoints"]
    L4["4. Authentication\nJWT + Argon2"]
    L5["5. Authorization\nRole + Group membership"]
    L6["6. Device Verification\nOTP challenge"]
    L7["7. Financial Integrity\nAtomic ops + webhook HMAC"]
    L8["8. Audit Logging\nAll sensitive operations"]

    L1 --> L2 --> L3 --> L4 --> L5 --> L6 --> L7 --> L8
```

- **Passwords**: Argon2id (memory=19MiB, time=2, parallelism=1)
- **Access Tokens**: JWT HS256, 15 min expiry, in-memory only
- **Refresh Tokens**: JWT HS256, 7 day expiry, HttpOnly Secure cookie, SHA-256 hashed in DB
- **OTP**: 6-digit, SHA-256 hashed, 10 min expiry, 3 attempt lockout
- **Webhooks**: HMAC-SHA256 signature verification with 5 min timestamp tolerance
- **Rate Limiting**: 100 req/min global, tighter limits on auth endpoints
- **CORS**: Explicit origin allowlist (no wildcard in production)

---

## Background Jobs

```mermaid
flowchart LR
    subgraph QueueLayer["Job Queues (BullMQ + Redis)"]
        Email["email.queue"]
        Notif["notification.queue"]
        Payment["payment.queue"]
        Payout["payout.queue"]
        Webhook["webhook.queue"]
        Contribution["contribution.queue"]
        Recon["reconciliation.queue"]
        Report["report.queue"]
        Analytics["analytics.queue"]
        Security["security.queue"]
    end

    subgraph Schedule["Cron Schedule"]
        Daily["Daily midnight"]
        Hourly["Every hour"]
        Daily6["Daily 6 AM"]
    end

    Schedule -->|UPDATE_PLATFORM_METRICS| Analytics
    Schedule -->|CHECK_OVERDUE| Contribution
    Schedule -->|VERIFY_PAYMENT| Payment
    Schedule -->|CHECK_PAYOUT_STATUS| Payout
    Schedule -->|CLEANUP_SESSIONS| Security
    Schedule -->|GENERATE_REVENUE_REPORT| Report
```

---

## Deployment

See `docs/deployment.md` for complete production deployment guide including:

- VPS setup with Node.js, PostgreSQL, Redis
- Nginx reverse proxy configuration
- SSL certificate setup (Let's Encrypt)
- PM2 process management
- Database backup and restore procedures
- Namecheap-specific guidance

---

## Why Kolo Matters

- **Real African Problem**: Solves a challenge affecting millions in cooperative communities
- **Production Ready**: Admin systems, security controls, payment reconciliation, deployment docs
- **Strong Architecture**: Clean layered architecture, double-entry accounting, event-driven processing
- **Scalable Foundation**: Designed for expansion into SME finance, community banking, digital wallets

---

## License

Licensed under the terms specified in `LICENSE.md`.

---

## Author

**Oluwayemi Oyinlola**  
Email: [oluwayemioyinlola2@gmail.com](mailto:oluwayemioyinlola2@gmail.com)  
Portfolio: https://www.oyinlola.site/

---

<p align="center">
  Built with ❤️ to modernize African cooperative finance.
</p>
