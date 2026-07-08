# Kolo — Product Overview

Kolo is a **digital cooperative savings platform** that modernizes traditional African **Ajo** and **Esusu** systems. It enables groups of people to save together, track contributions in real-time, automate payouts, and manage finances — all from a mobile-first web application.

## The Vision

To bridge the gap between informal community savings and modern financial infrastructure. Kolo brings trust, transparency, and automation to cooperative savings, making it accessible to everyone — from small community groups to large organized cooperatives.

## Core Value Proposition

- **Digitize Ajo/Esusu** — Replace manual cash collections with digital payments via bank transfer, USSD, or card.
- **Automate Payouts** — Distribute savings pools automatically with approval workflows.
- **Real-time Transparency** — Every contribution and payout is recorded on a double-entry ledger visible to members.
- **Role-based Access** — Super admins, group admins, and members each have tailored dashboards.
- **Secure by Design** — JWT tokens, hashed passwords (Argon2), SHA-256 hashed refresh tokens, email OTP challenges, and rate limiting throughout.

## Target Users

- **Community savings groups** (Ajo/Esusu circles)
- **Workplace cooperatives**
- **ROSCAs** (Rotating Savings and Credit Associations)
- **Small business savings clubs**
- **Landlord/tenant associations**

## Platform Roles

| Role | Access |
|---|---|
| **SUPER_ADMIN** | Full platform management, all groups, revenue analytics, user management, system settings |
| **GROUP_ADMIN/GROUP_OWNER** | Manage their group, approve payouts, manage members, view reports |
| **MEMBER** | Join groups, make contributions, receive payouts, view personal history |

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript 6, Vite 8, Tailwind CSS 4, TanStack Query 5, Zustand 5, React Router 8 |
| Backend | Fastify 5, TypeScript, Prisma ORM |
| Database | PostgreSQL |
| Queue | BullMQ (Redis) |
| Payments | Nomba API integration |
| Auth | JWT (jose), Argon2 password hashing, SHA-256 session tokens |
| Email | SMTP via Nodemailer |
| Logging | Pino with structured JSON logging |
| Deployment | Node.js (PM2 or similar) |

Kolo is built for **security, reliability, and financial accuracy** — every monetary value is stored as integers (kobo), all wallet operations use atomic database operations, and the architecture follows strict layered separation of concerns.
