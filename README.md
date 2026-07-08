# Kolo

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Fintech-success"/>
  <img src="https://img.shields.io/badge/Backend-Fastify%205-blue"/>
  <img src="https://img.shields.io/badge/Frontend-React%2019-61DAFB"/>
  <img src="https://img.shields.io/badge/Database-PostgreSQL-4169E1"/>
  <img src="https://img.shields.io/badge/Queue-BullMQ%20%2B%20Redis-DC382D"/>
  <img src="https://img.shields.io/badge/Payments-Nomba-green"/>
  <img src="https://img.shields.io/badge/Auth-JWT%20%2B%20Argon2-purple"/>
  <img src="https://img.shields.io/badge/Demo-Offline-amber"/>
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
- Real-time notifications across in-app and email channels
- Role-based dashboards for members, group admins, and platform operators
- A fully offline **demo mode** that simulates the entire platform without any backend

---

## Try the Demo

No installation required — Kolo includes a complete offline demo:

```bash
cd kolo-frontend
npm install
npm run dev
# Open http://localhost:5173/demo
```

Select a role, enter password `Demo@1234`, OTP `000000`, and explore all dashboards with realistic mock data. See `docs/demo-guide.md` for a full walkthrough.

---

## System Architecture

```mermaid
flowchart TB
    subgraph Frontend["Frontend (React 19 SPA)"]
        Landing["Landing Pages\n/, /pricing, /about"]
        Auth["Auth Pages\n/login, /register, /verify-otp"]
        Member["Member Dashboard\n/member/*"]
        GroupAdmin["Group Admin\n/group/admin/*"]
        SuperAdmin["Super Admin\n/ajo/admin/*"]
        Demo["Demo Mode\n/demo, /demo/checkout"]
    end

    subgraph Backend["Backend (Fastify 5)"]
        Router["Route Registry\n/api/v1/*"]
        Middleware["CORS → Helmet → RateLimit\n→ Auth → Role → Group"]
        Controllers["18 Controllers"]
        Services["30+ Business Services"]
        Repositories["32 Prisma Repositories"]
    end

    subgraph Infrastructure["Infrastructure"]
        PG[("PostgreSQL 15+\n(Prisma ORM)")]
        Redis[("Redis 7+\n(BullMQ + Token Cache)")]
        Jobs["Background Jobs\n14 queues, 10+ processors"]
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

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19 | UI framework |
| **TypeScript** | 6 | Type safety |
| **Vite** | 8 | Build tool and dev server |
| **Tailwind CSS** | 4 | Utility-first CSS |
| **Radix UI** | — | Accessible UI primitives (26 packages) |
| **TanStack Query** | 5 | Server state management and caching |
| **Zustand** | 5 | Client state (auth, theme, UI) |
| **React Router** | 8 | SPA routing |
| **React Hook Form** + **Zod** | — | Form validation |
| **Axios** | 1 | HTTP client with interceptors |
| **Recharts** | — | Data visualization and charts |
| **Lucide React** | — | UI icons |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 20+ | Runtime |
| **TypeScript** | 6 | Type safety |
| **Fastify** | 5 | HTTP server framework |
| **Prisma** | 7 | ORM with type-safe queries |
| **PostgreSQL** | 15+ | Primary data store |
| **Redis** | 7+ | BullMQ queue + token cache |
| **BullMQ** | 5 | Background job processing (14 queues) |
| **JWT (jose)** + **Argon2** | — | Authentication and password hashing |
| **Pino** | 10 | Structured JSON logging |
| **Zod** | 4 | Request validation |
| **Nodemailer** | — | Email delivery |

### External Services

| Service | Purpose |
|---|---|
| **Nomba API** | Payment initiation, verification, transfers, virtual accounts |
| **SMTP** | Transactional email delivery |

---

## Features

### Demo Mode (Offline)
- Complete platform simulation — no backend, no database, no API keys
- 3 demo roles: Platform Admin, Group Admin, Member
- Interactive login with password (`Demo@1234`) and OTP (`000000`)
- 13 + 9 + 5 fully functional dashboard pages per role with mock data
- Simulated Nomba payment checkout with 3 test cards (success/wrong/expired outcomes)
- Dashboard preview gallery with 27 clickable screenshots in a tabbed carousel
- localStorage-persisted data with reset capability
- Works entirely offline

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

### Admin Dashboards
- **Super Admin** (14 pages): Platform metrics, user management, revenue analytics, transaction monitoring, payout approval, KYC verification, dispute resolution, security monitoring, audit logs
- **Group Admin** (11 pages): Member management, contribution tracking, payout approval, reports, payment analytics, notifications
- **Member** (11 pages): Savings progress, payment history, groups, notification center, profile settings

---

## Project Structure

```
kolo/
├── kolo-backend/                    # Fastify API server
│   ├── prisma/                      # Schema, migrations, seed
│   │   └── schema.prisma            # 25+ models, 30+ enums
│   ├── src/
│   │   ├── config/                  # App, env, DB, Nomba config
│   │   ├── constants/               # Roles, error codes, payment
│   │   ├── controllers/             # 18 HTTP handlers
│   │   ├── database/                # Prisma + Redis singletons
│   │   ├── dto/                     # Data transfer objects
│   │   ├── errors/                  # Custom error classes
│   │   ├── events/                  # EventBus + handlers
│   │   ├── integrations/            # Nomba, email, SMS, WhatsApp
│   │   ├── interfaces/              # TypeScript interfaces
│   │   ├── jobs/                    # BullMQ queues, workers, scheduler
│   │   │   ├── processors/          # 10 processor files
│   │   │   ├── queue-manager.ts     # Singleton queue factory
│   │   │   └── scheduler.ts         # Cron job registration
│   │   ├── loaders/                 # App bootstrap (9 loaders)
│   │   ├── logger/                  # Pino-based structured logging
│   │   │   ├── core/                # Base Logger + types
│   │   │   ├── implementations/     # Domain-specific loggers
│   │   │   └── transports/          # Console, file, DB
│   │   ├── middleware/              # Auth, Role, Group, RateLimit, Error
│   │   ├── models/                  # Domain models
│   │   ├── repositories/            # 32 Prisma data access classes
│   │   ├── routes/                  # 18 route definitions
│   │   ├── services/                # 30+ business logic classes
│   │   ├── utils/                   # JWT, hash, encryption, pagination
│   │   └── validators/              # 14 Zod schemas
│   ├── .env.example
│   └── package.json
│
├── kolo-frontend/                   # React SPA
│   ├── public/                      # Static assets, demo screenshots
│   ├── src/
│   │   ├── api/                     # Axios client with auth + demo interceptors
│   │   ├── app/                     # Router, providers, Zustand store
│   │   ├── components/              # Shared UI + layout components
│   │   ├── features/
│   │   │   ├── auth/                # Login, register, OTP, password reset
│   │   │   ├── landing/             # Public marketing pages (10 pages)
│   │   │   ├── admin/               # Super Admin (14 pages)
│   │   │   ├── group/               # Group Admin (11 pages)
│   │   │   ├── member/              # Member (11 pages)
│   │   │   ├── demo/                # Offline demo system
│   │   │   │   ├── api/             # Demo request adapter
│   │   │   │   ├── components/      # DashboardGallery with lightbox
│   │   │   │   ├── data/            # Seed users, OTP codes, payment cards
│   │   │   │   ├── pages/           # Demo login + checkout simulation
│   │   │   │   └── store/           # In-memory database with localStorage
│   │   │   ├── contribution/        # Contribution hooks/services
│   │   │   ├── cooperative/         # Cooperative hooks/services
│   │   │   └── payment/             # Payment hooks/services
│   │   ├── hooks/                   # 28 TanStack Query hooks
│   │   ├── services/                # 20 API service functions
│   │   ├── styles/                  # CSS files
│   │   ├── types/                   # TypeScript type definitions
│   │   └── utils/                   # Formatting, CSV, error, env
│   ├── scripts/                     # Playwright screenshot generation
│   ├── .env.example
│   └── package.json
│
├── docs/                            # Engineering documentation
│   ├── architecture.md              # System architecture overview
│   ├── authentication.md            # Auth flows with sequence diagrams
│   ├── database-design.md           # ER diagram + model documentation
│   ├── demo-guide.md                # Offline demo walkthrough
│   ├── frontend-architecture.md     # React app structure + demo interceptors
│   ├── webhook-flow.md              # Webhook processing pipeline
│   ├── queue-system.md              # BullMQ architecture and jobs
│   ├── notification-system.md       # Event-driven notification system
│   ├── payment-flow.md              # Payment lifecycle with state diagrams
│   ├── nomba-integration.md         # Nomba API integration details
│   ├── payout-flow.md               # Payout lifecycle and transfers
│   ├── deployment.md                # Production deployment guide
│   ├── security-architecture.md     # Security layers, auth, audit
│   ├── environment.md               # Environment variables reference
│   ├── api-endpoints.md             # Complete API reference
│   └── ...                          # (26 total documentation files)
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
| `docs/database-design.md` | 25+ models, relationships, ledger | ER diagram (30+ entities) |
| `docs/webhook-flow.md` | Nomba webhook verification & processing | Pipeline flowchart + sequence diagram |
| `docs/queue-system.md` | BullMQ queues, workers, schedules | Architecture + state diagrams |
| `docs/notification-system.md` | EventBus, channels, templates | Architecture + ER diagrams |
| `docs/payment-flow.md` | Payment lifecycle, fee engine | State + sequence diagrams |
| `docs/nomba-integration.md` | Payment gateway integration | 7 flowcharts + sequence diagrams |
| `docs/payout-flow.md` | Payout lifecycle, transfers | State + sequence diagrams |
| `docs/security-architecture.md` | Security layers, auth, audit | 5 flowchart + sequence diagrams |
| `docs/frontend-architecture.md` | React app + demo mode interceptors | 6 architecture diagrams |
| `docs/demo-guide.md` | Offline demo walkthrough | Architecture + reference tables |
| `docs/deployment.md` | Production deployment steps | Architecture + Nginx flow diagrams |
| `docs/api-endpoints.md` | Complete API reference | (495 lines) |
| `docs/environment.md` | Environment variables | (206 lines) |
| `docs/features.md` | Features by role | Role-based tables |
| `docs/product-overview.md` | Product overview and vision | Strategic |
| `docs/problem-and-solution.md` | Problem and value proposition | Strategic |
| `docs/user-flow.md` | User flows by role | 10+ flow diagrams |
| `docs/pricing.md` | Pricing and business model | 3-tier comparison |
| `docs/business-model.md` | Business model details | Fee architecture |
| `docs/judging-guide.md` | Competition judging document | Evaluation criteria |
| `docs/monitoring.md` | Monitoring and observability | Architecture + alert config |
| `docs/backend-architecture.md` | Backend architecture details | Layer diagrams |
| `docs/api-overview.md` | API principles and standards | Reference |
| `docs/system-architecture.md` | Overall architecture | Reference |

---

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ (not needed for demo mode)
- Redis 7+ (not needed for demo mode)

### Demo Mode (No Backend Required)

```bash
cd kolo-frontend
npm install
npm run dev
# Open http://localhost:5173/demo
# Password: Demo@1234
# OTP: 000000
```

### Full Stack Setup

The backend API runs on **`http://localhost:4000`** by default. All routes are prefixed with `/api/v1/*`.

#### Backend Setup

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

#### Frontend Setup

```bash
cd kolo-frontend
npm install

# Configure environment
# Edit kolo-frontend/.env with your API URL

# Start development server
npm run dev
```

#### Environment Variables

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

# Frontend (kolo-frontend/.env)
VITE_API_URL=http://localhost:4000/api/v1
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

## Testing

```bash
# Backend tests (Vitest)
cd kolo-backend
npm test

# Frontend type checking
cd kolo-frontend
npm run typecheck
```

---

## Screenshot Generation

Dashboard previews for the demo page are generated with Playwright:

```bash
cd kolo-frontend
pip install playwright
playwright install chromium
python scripts/screenshots.py
```

The script logs in as each demo role and captures 27 screenshots saved to `public/demo-screenshots/`.

---

## Why Kolo Matters

- **Real African Problem**: Solves a challenge affecting millions in cooperative communities
- **Production Ready**: Admin systems, security controls, payment reconciliation, deployment docs
- **Strong Architecture**: Clean layered architecture, double-entry accounting, event-driven processing
- **Demo-First Design**: Fully interactive demo lets anyone explore the platform instantly
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
