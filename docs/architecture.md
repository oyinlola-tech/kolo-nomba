# System Architecture

This document describes the overall architecture of Kolo — from the frontend React SPA through the backend Fastify API to the database, queue infrastructure, and external service integrations.

---

## High-Level Architecture

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
        Middleware["Middleware Pipeline\nCORS → Helmet → RateLimit → Auth → Role"]
        Controllers["Controllers\n17 handlers"]
        Services["Services\n30+ business logic"]
        Repositories["Repositories\n31 Prisma data access"]
    end

    subgraph Infrastructure["Infrastructure"]
        PG[("PostgreSQL\n(Prisma ORM)")]
        Redis[("Redis\n(BullMQ + Token Cache)")]
        Jobs["Background Jobs\n10 queues + 20 processors"]
        EventBus["In-Process EventBus\n7 event types"]
    end

    subgraph External["External Integrations"]
        Nomba["Nomba API\nPayment Gateway"]
        Email["SMTP / Nodemailer\nEmail Provider"]
        SMS["SMS Provider\n(Disabled Stub)"]
        WhatsApp["WhatsApp\n(Disabled Stub)"]
    end

    Frontend -->|HTTPS\nwithCredentials| Router
    Router --> Middleware
    Middleware --> Controllers
    Controllers --> Services
    Services --> Repositories
    Services --> Jobs
    Services --> EventBus
    Repositories --> PG
    Jobs --> Redis
    Services --> Nomba
    Services --> Email
    Services --> SMS
    Services --> WhatsApp
    EventBus --> Email
    Nomba -->|Webhook| Router
```

---

## Request Lifecycle

```mermaid
sequenceDiagram
    participant Browser
    participant Fastify as Fastify Server
    participant Middleware
    participant Controller
    participant Service
    participant Repository
    participant Database

    Browser->>Fastify: HTTP Request
    Fastify->>Middleware: Route Handler
    Middleware->>Middleware: CORS Validation
    Middleware->>Middleware: Helmet Security Headers
    Middleware->>Middleware: Rate Limit Check
    Middleware->>Middleware: Request Context (requestId)
    Middleware->>Middleware: JWT Authentication
    Middleware->>Middleware: Role Authorization
    Middleware->>Controller: Pass to Handler
    Controller->>Controller: Extract params/body
    Controller->>Controller: Validate (Zod Schema)
    Controller->>Service: Execute Business Logic
    Service->>Repository: Query Data
    Repository->>Database: Prisma Query
    Database-->>Repository: Results
    Repository-->>Service: Typed Data
    Service-->>Controller: Result
    Controller-->>Fastify: JSON Response
    Fastify-->>Browser: HTTP Response
```

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React 18 + TypeScript | UI rendering |
| **Build Tool** | Vite 6 | Fast dev/build |
| **Styling** | Tailwind CSS 4 + shadcn/ui (Radix UI) | Design system |
| **Server State** | TanStack Query 5 | API data caching |
| **Client State** | Zustand 5 | Auth, theme, UI state |
| **Backend Framework** | Fastify 5 | High-performance HTTP server |
| **ORM** | Prisma 7 | Type-safe database access |
| **Database** | PostgreSQL 15+ | Primary data store |
| **Queue** | BullMQ 5 + Redis | Background job processing |
| **Auth** | JWT (jose) + Argon2 | Token-based authentication |
| **Payments** | Nomba API | Payment initiation, verification, transfers |
| **Email** | Nodemailer + SMTP | Transactional notifications |
| **Logging** | Pino 10 | Structured JSON logging |
| **Validation** | Zod 4 | Request/response validation |
| **HTTP Client (FE)** | Axios 1 | API communication with token refresh |

---

## Layer Responsibilities

### Routes (`routes/*.route.ts`)
- Define API endpoints with HTTP methods and paths
- Attach middleware chains (auth, role, group access)
- Bind controller handlers
- No business logic

### Middleware (`middleware/*.ts`)
1. **CORS** — Origin validation with explicit allowlist
2. **Helmet** — Security headers (CSP, HSTS, X-Frame-Options)
3. **Rate Limiter** — Global 100 req/min, per-route custom limits
4. **Request Context** — Assigns `requestId`, tracks `startTime`
5. **Auth Middleware** — Verifies JWT, loads user, checks ACTIVE status
6. **Role Middleware** — Checks `User.role` against required roles
7. **Group Middleware** — Verifies group membership and role (OWNER/ADMIN/MEMBER)

### Controllers (`controllers/*.controller.ts`)
- Extract request parameters, body, and query strings
- Validate input with Zod schemas
- Call service methods
- Return standardized JSON responses via `ResponseUtil`

### Services (`services/*.service.ts`)
- All business logic lives here
- Orchestrate repository calls, external API calls, job queueing
- Handle audit logging and event publishing

### Repositories (`repositories/*.repository.ts`)
- Pure database access via Prisma
- No business logic, no HTTP concerns

---

## Background Job Architecture

```mermaid
flowchart LR
    subgraph Producers["Job Producers"]
        Service["Service Layer"]
        Webhook["Webhook Handler"]
        Scheduler["Cron Scheduler"]
    end

    subgraph Redis["Redis (BullMQ)"]
        EmailQ["email.queue"]
        NotifQ["notification.queue"]
        PaymentQ["payment.queue"]
        PayoutQ["payout.queue"]
        WebhookQ["webhook.queue"]
        ContributionQ["contribution.queue"]
        ReconQ["reconciliation.queue"]
        ReportQ["report.queue"]
        AnalyticsQ["analytics.queue"]
        SecurityQ["security.queue"]
    end

    subgraph Workers["Workers & Processors"]
        EmailW["Send Email"]
        NotifW["Send Notification"]
        PaymentW["Verify Payment"]
        PayoutW["Process Transfer"]
        WebhookW["Process Event"]
        ContributionW["Check Overdue"]
        ReconW["Sync Transactions"]
        ReportW["Generate Report"]
        AnalyticsW["Update Metrics"]
        SecurityW["Analyze Events"]
    end

    Service -->|Add Job| EmailQ
    Service -->|Add Job| NotifQ
    Service -->|Add Job| PaymentQ
    Service -->|Add Job| PayoutQ
    Webhook -->|Enqueue| WebhookQ
    Scheduler -->|Repeatable| PaymentQ
    Scheduler -->|Repeatable| PayoutQ
    Scheduler -->|Daily| ContributionQ
    Scheduler -->|Daily| ReportQ
    Scheduler -->|Daily| AnalyticsQ
    Scheduler -->|Daily| SecurityQ

    EmailQ --> EmailW
    NotifQ --> NotifW
    PaymentQ --> PaymentW
    PayoutQ --> PayoutW
    WebhookQ --> WebhookW
    ContributionQ --> ContributionW
    ReconQ --> ReconW
    ReportQ --> ReportW
    AnalyticsQ --> AnalyticsW
    SecurityQ --> SecurityW
```

---

## Event-Driven Notification Flow

```mermaid
flowchart LR
    Service["Service Layer"]
    EventBus["In-Process EventBus"]
    Handler["NotificationEventHandler"]
    NotifService["NotificationService"]
    ChannelResolver["Channel Resolver"]
    Queue["notification.queue"]
    Email["Email Provider"]
    SMS["SMS Provider\n(Stub)"]
    WhatsApp["WhatsApp Provider\n(Stub)"]
    InApp["In-App DB Record"]

    Service -->|publish| EventBus
    EventBus -->|subscribe| Handler
    Handler --> NotifService
    NotifService --> ChannelResolver
    ChannelResolver --> Queue
    Queue --> Email
    Queue --> SMS
    Queue --> WhatsApp
    ChannelResolver --> InApp
```

---

## Key Architectural Decisions

### 1. Clean Architecture (Ansofra Pattern)
Strict layer separation prevents controllers from accessing databases directly, ensures services contain all business logic, and keeps repositories free of business rules.

### 2. Webhook-Driven Payment Verification
Payment status is never trusted from the frontend. All confirmations arrive through HMAC-signed Nomba webhooks with duplicate event detection.

### 3. Double-Entry Accounting
Every financial transaction records matching credit and debit entries in a `LedgerEntry` table, linked through `FinancialTransaction` records.

### 4. In-Memory Access Tokens
Access tokens are stored only in JavaScript memory (module-level variable + Zustand store). On page reload, `initAuth()` silently refreshes via HttpOnly refresh cookie.

### 5. Polymorphic Wallet Ownership
The `Wallet` model uses `ownerType` + `ownerId` to support User, Group, and Platform wallets with atomic balance operations.

### 6. All Monetary Values as Integers (Kobo)
All financial values are stored as integers representing the smallest currency unit (kobo) to avoid floating-point precision issues:
- ₦10,000 = 1,000,000 kobo
- ₦500 = 50,000 kobo
