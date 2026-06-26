# User Flow

This document describes how different user roles interact with Kolo, from account creation to daily usage.

---

## User Roles Overview

```
                    ┌──────────────┐
                    │   Visitor    │
                    └──────┬───────┘
                           │ Register
                           ▼
                    ┌──────────────┐
                    │    User     │
                    │  (PENDING)  │
                    └──────┬───────┘
                           │ Verify OTP
                           ▼
                    ┌──────────────┐
                    │    User     │
                    │  (ACTIVE)   │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────────┐
              ▼            ▼                ▼
       ┌──────────┐ ┌──────────┐   ┌──────────────┐
       │  MEMBER  │ │GRP ADMIN │   │ SUPER_ADMIN  │
       └──────────┘ └──────────┘   └──────────────┘
```

---

## Super Admin Flow

```
SUPER_ADMIN Login
        │
        ▼
  Super Admin Dashboard
        │
        ├── View Platform Metrics (users, groups, revenue)
        ├── User Management (list, search, suspend)
        ├── Group Management (oversight, status changes)
        ├── Transaction Monitoring (all platform transactions)
        ├── Revenue Analytics (fee earnings, trends)
        ├── Verification Queue (approve user verifications)
        ├── Security Events (monitor suspicious activity)
        ├── Nomba Monitoring (status, transactions, webhooks)
        ├── Background Jobs (monitor, retry)
        └── Platform Settings (configure fees, limits)
```

### Super Admin Registration Flow

```
1. Super admin is seeded via environment variables
   └── SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD in .env
2. On first application start, seed script creates super admin
3. Super admin logs in at /ajo/admin/login
4. Directed to /ajo/admin/dashboard
```

---

## Group Admin Flow

```
Register → Verify OTP → Login
        │
        ▼
  Create Group
        │
        ├── Set group name, description, category
        ├── Configure contribution rules
        └── Invite members (email invitations)
              │
              ▼
  Group Admin Dashboard
        │
        ├── Member Management
        │   ├── View members & status
        │   ├── Approve join requests
        │   ├── Remove members
        │   └── Assign roles
        │
        ├── Contribution Management
        │   ├── Create contribution plan
        │   │   └── Set amount, frequency, duration
        │   ├── Monitor contribution cycles
        │   ├── View member payment status
        │   └── Send reminders
        │
        ├── Payout Management
        │   ├── Create payout
        │   ├── Approve payout (if multi-step)
        │   ├── Process payout
        │   ├── Schedule recurring payouts
        │   └── Download receipts
        │
        ├── Reports
        │   ├── Contribution reports
        │   ├── Payout reports
        │   └── Activity logs
        │
        └── Group Settings
            ├── Update group info
            └── Manage notification preferences
```

---

## Member Flow

```
Register → Verify OTP → Login
        │
        ▼
  Member Dashboard (Home)
        │
        ├── Active Groups Overview
        │   └── View savings progress, upcoming contributions
        │
        ├── Groups
        │   ├── Browse available groups
        │   ├── Request to join
        │   └── View group details & members
        │
        ├── Make Payment
        │   ├── Select payment method:
        │   │   ├── Nomba Wallet
        │   │   ├── Bank Transfer
        │   │   └── Card Payment
        │   ├── Enter amount
        │   ├── Confirm payment
        │   └── View receipt
        │
        ├── Transaction History
        │   ├── Past contributions
        │   ├── Received payouts
        │   └── Payment receipts
        │
        ├── Notifications
        │   ├── Payment reminders
        │   ├── Payout alerts
        │   └── Group updates
        │
        └── Profile
            ├── Update personal info
            ├── Change password
            ├── Manage notification preferences
            └── Manage payout accounts
```

---

## Authentication Flows

### Registration Flow

```
┌─────────┐     ┌──────────┐     ┌──────────┐     ┌────────────┐
│ Register │────>│ Verify   │────>│ Complete │     │  Welcome   │
│  Page    │     │ OTP Page │     │  Profile │     │ Dashboard  │
└─────────┘     └──────────┘     └──────────┘     └────────────┘
      │              │
      │ Submit       │ Enter 6-digit code
      │ email/phone  │ sent to email
      │ password     │
      ▼              ▼
  User created    Code verified
  with PENDING    → status = ACTIVE
  status          → tokens issued
  OTP sent to     → redirected to
  email           role-based dashboard
```

### Login Flow (Known Device)

```
┌─────────┐     ┌──────────┐     ┌────────────┐
│  Login  │────>│ Verify   │────>│ Dashboard  │
│  Page   │     │ Password │     │ (by role)  │
└─────────┘     └──────────┘     └────────────┘
      │              │
      │ Email/       │ Known device
      │ Password     hash found
      ▼              ▼
  Check device   Tokens issued
  hash against   Session created
  existing       Redirected
  sessions
```

### Login Flow (Unknown Device)

```
┌─────────┐     ┌──────────┐     ┌────────────┐     ┌────────────┐
│  Login  │────>│ Verify   │────>│ OTP        │────>│ Dashboard  │
│  Page   │     │ Password │     │ Challenge  │     │ (by role)  │
└─────────┘     └──────────┘     └────────────┘     └────────────┘
      │              │                  │
      │ Email/       │ No device        │ Enter
      │ Password     │ hash match       │ 6-digit OTP
      ▼              ▼                  ▼
  Device hash   OTP sent to       Tokens issued
  compared      registered        Device marked
  against       email             as known
  sessions
```

---

## Payment Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌───────────┐
│  Select  │────>│ Choose   │────>│ Confirm  │────>│ Payment   │
│  Plan/   │     │ Payment  │     │ & Pay    │     │ Receipt   │
│  Amount  │     │ Method   │     │          │     │           │
└──────────┘     └──────────┘     └──────────┘     └───────────┘
                                          │
                                          ▼
                                    Nomba Gateway
                                          │
                                    ┌─────┴──────┐
                                    │            │
                                    ▼            ▼
                              Successful     Failed
                                  │            │
                                  ▼            ▼
                            Webhook       Retry or
                            verifies      choose new
                            payment       method
                                  │
                                  ▼
                            Wallet credited
                            Notification sent
```

---

## Payout Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌───────────┐
│  Admin   │────>│ Approve  │────>│ Process  │────>│ Transfer  │
│  Creates │     │ (if req) │     │          │     │ Complete  │
│  Payout  │     │          │     │          │     │           │
└──────────┘     └──────────┘     └──────────┘     └───────────┘
                                                          │
                                                          ▼
                                                    Ledger Updated
                                                    Notifications
                                                    Receipts Sent
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (React SPA)                    │
│  ┌───────────┐  ┌──────────┐  ┌───────────┐  ┌──────────┐ │
│  │ Landing   │  │ Auth     │  │ Admin     │  │ Member   │ │
│  │ Pages     │  │ Pages    │  │ Dashboard │  │ Dashboard│ │
│  └───────────┘  └──────────┘  └───────────┘  └──────────┘ │
│         │             │             │              │        │
│         └─────────────┼─────────────┼──────────────┘        │
│                       │             │                       │
│              ┌────────▼─────────────▼──────────┐            │
│              │     API Client (Axios)           │            │
│              │   with Auth Interceptor          │            │
│              └──────────────────────────────────┘            │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS / REST API
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Fastify Backend Server                     │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐ │
│  │ Routes   │→│Middleware│→│Controllers│→│  Services   │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────┬──────┘ │
│                                                   │        │
│                                          ┌────────▼──────┐ │
│                                          │  Repositories │ │
│                                          └────────┬──────┘ │
│                                                   │        │
│                                          ┌────────▼──────┐ │
│                                          │   Prisma ORM  │ │
│                                          └────────┬──────┘ │
└─────────────────────────────────────────────────────┬───────┘
                                                      │
                                          ┌───────────▼──────┐
                                          │   PostgreSQL     │
                                          └──────────────────┘

External Services:
  ┌──────────┐     ┌──────────┐     ┌──────────┐
  │  Nomba   │     │  SMTP    │     │  Redis   │
  │  API     │     │  Server  │     │  (Queue) │
  └──────────┘     └──────────┘     └──────────┘
```
