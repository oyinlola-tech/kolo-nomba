# System Architecture

This document describes the overall architecture of Kolo — from the frontend React SPA through the backend Fastify API to the database and external services.

---

## High-Level Architecture Diagram

```
                  ┌─────────────────────────────────────────┐
                  │            Internet / CDN               │
                  └──────┬────────────────────┬────────────┘
                         │                    │
              ┌──────────▼──────┐    ┌─────────▼──────────┐
              │  React SPA      │    │  Static Assets     │
              │  (public/)      │    │  (images, fonts)   │
              └──────────┬──────┘    └────────────────────┘
                         │ API Calls (HTTPS)
                         │ withCredentials: true
                         ▼
              ┌──────────────────────────────┐
              │      Fastify API Server       │
              │      (kolo-backend/)          │
              │                              │
              │  ┌─────┐ ┌──────┐ ┌──────┐  │
              │  │Route│→│Middle│→│Contr │  │
              │  │Reg  │ │ware  │ │oller │  │
              │  └─────┘ └──────┘ └──┬───┘  │
              │                      │      │
              │                 ┌────▼───┐  │
              │                 │Service │  │
              │                 └───┬────┘  │
              │               ┌────┼────┐  │
              │          ┌────▼┐ ┌─▼─┐ ┌▼─┐│
              │          │Repo │ │Int│ │JOB││
              │          └──┬──┘ └───┘ └──┘│
              │             │              │
              └─────────────┼──────────────┘
                            │
              ┌─────────────▼──────────────┐
              │      PostgreSQL DB         │
              │   (Prisma ORM)             │
              └────────────────────────────┘

External Services:
  ┌───────────┐  ┌───────────┐  ┌─────────────┐
  │ Nomba API │  │ SMTP Mail │  │ Redis       │
  │ (Payment) │  │ Server    │  │ (BullMQ)    │
  └───────────┘  └───────────┘  └─────────────┘
```

---

## Request Lifecycle

```
1. Browser → HTTP Request
        │
2. Fastify Router
        │
3. Middleware Pipeline
   ├── CORS (origin validation)
   ├── Helmet (security headers)
   ├── Rate Limiter (global + per-route)
   ├── Request Context (requestId, startTime)
   ├── Auth Middleware (JWT verification, user lookup)
   └── Role Middleware (role authorization)
        │
4. Controller
   ├── Extract params/body/query
   ├── Validate with Zod schema
   └── Call Service
        │
5. Service Layer
   ├── Business logic
   ├── Repository calls
   ├── External API calls
   ├── Audit logging
   └── Structured logging
        │
6. Repository (Prisma)
   ├── Database queries
   └── Return typed results
        │
7. Response
   └── JSON response via ResponseUtil
```

---

## Layer Separation

```
┌──────────────────────────────────────────────────────┐
│                    ROUTES                             │
│  Define endpoints, attach middleware, bind handlers  │
├──────────────────────────────────────────────────────┤
│                  MIDDLEWARE                           │
│  Auth, Role, Group access, Rate limit, Error handler │
├──────────────────────────────────────────────────────┤
│                 CONTROLLERS                           │
│  Extract request data, validate, call service        │
├──────────────────────────────────────────────────────┤
│                   SERVICES                            │
│  Business logic, orchestration, validation           │
├──────────────────────────────────────────────────────┤
│                REPOSITORIES                           │
│  Database access via Prisma                          │
├──────────────────────────────────────────────────────┤
│                   DATABASE                            │
│  PostgreSQL + Prisma ORM                             │
└──────────────────────────────────────────────────────┘
```

---

## Key Architectural Decisions

### 1. Clean Architecture (Ansofra Pattern)

Strict layer separation ensures:
- Controllers never access databases directly
- Services contain all business logic
- Repositories have no business rules
- Routes only handle HTTP routing

### 2. In-Memory Access Tokens

Access tokens are stored only in JavaScript memory (module-level variable in the API client + Zustand store). On page reload, `initAuth()` silently refreshes via the HttpOnly refresh cookie.

### 3. Webhook-Driven Payment Verification

Payment status is never trusted from the frontend. The flow is:
```
Frontend → Initiate Payment → Nomba Gateway
                                    ↓
Nomba sends webhook → Server verifies HMAC → Dedup → Process Payment
                                    ↓
                            Update DB, Credit Wallet, Notify User
```

### 4. Double-Entry Accounting

Every financial transaction records equal credits and debits:
```
Member Payment of ₦10,000:
  Debit:  Platform (fee account)      ₦100 (fee)
  Credit: Group Wallet                ₦9,900
  Debit:  Member (payment account)    ₦10,000
```

### 5. Background Job Queue

Heavy operations are processed asynchronously via BullMQ:
- Payment verification
- Email delivery
- Payout processing
- Report generation
- Analytics updates
- Reconciliation

### 6. Event-Driven Notifications

The in-process EventBus decouples business logic from notification delivery:
```
Service → EventBus.publish(event) → EventHandler → NotificationService
```

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React 18 + TypeScript | UI rendering |
| **Build Tool** | Vite 6 | Fast dev/build |
| **Styling** | Tailwind CSS 4 + Radix UI | Design system |
| **State (Server)** | TanStack Query 5 | API caching |
| **State (Client)** | Zustand 5 | Auth, theme, UI |
| **Backend Framework** | Fastify 5 | HTTP server |
| **ORM** | Prisma 7 | Database access |
| **Database** | PostgreSQL | Primary data store |
| **Queue** | BullMQ + Redis | Async jobs |
| **Auth** | JWT (jose) + Argon2 | Authentication |
| **Payments** | Nomba API | Payment processing |
| **Email** | Nodemailer + SMTP | Notifications |
| **Logging** | Pino | Structured JSON logs |
| **Validation** | Zod 4 | Request/response validation |
| **HTTP Client** | Axios | API communication |

---

## Security Architecture

```
┌────────────────────────────────────────────────────────────┐
│                     Security Layers                         │
├────────────────────────────────────────────────────────────┤
│  1. Transport Security (HTTPS, Helmet headers)             │
│  2. Rate Limiting (global + per-route)                     │
│  3. CORS (explicit origins, no wildcard)                   │
│  4. Input Validation (Zod schemas on all endpoints)        │
│  5. Authentication (JWT access + HttpOnly refresh cookie)  │
│  6. Authorization (Role + Group membership checks)         │
│  7. Device Verification (OTP challenge for unknown devices)│
│  8. Financial Integrity (atomic ops, webhook verification) │
│  9. Audit Logging (all sensitive operations)              │
│ 10. Secrets Management (env vars only, never in code)     │
└────────────────────────────────────────────────────────────┘
```
