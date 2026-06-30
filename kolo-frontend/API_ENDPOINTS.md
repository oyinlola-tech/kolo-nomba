# Kolo Frontend — API Endpoint Reference

This document lists every backend API endpoint the frontend calls.

**Base URL**: Set via `VITE_API_URL` environment variable (e.g. `https://api.example.com/api/v1`)
**Auth**: JWT access token in `Authorization: Bearer <token>` header (in-memory only)
**Refresh**: HttpOnly cookie-based refresh token via `withCredentials: true`
**Content-Type**: `application/json`

---

## Authentication

| Method | Endpoint | Purpose | Service File |
|--------|----------|---------|-------------|
| POST | `/auth/login` | Member/cooperative login | `auth.service.ts` |
| POST | `/auth/register` | User registration | `auth.service.ts` |
| POST | `/auth/refresh` | Silent token refresh via HttpOnly cookie | `auth.service.ts` |
| POST | `/auth/logout` | Logout / invalidate session | `auth.service.ts` |
| GET | `/auth/me` | Get authenticated user profile | `auth.service.ts` |
| POST | `/auth/verify-otp` | Verify OTP code | `auth.service.ts` |
| POST | `/auth/resend-otp` | Resend OTP code | `auth.service.ts` |
| POST | `/auth/forgot-password` | Request password reset code | `auth.service.ts` |
| POST | `/auth/reset-password` | Reset password with code | `auth.service.ts` |

**Expected Response Shapes:**

Login: `{ data: { user: AuthUser, accessToken: string, role: string } }`
Register: `{ data: { userId: string, message: string } }`
Refresh: `{ accessToken: string }` or `{ data: { accessToken: string } }`
Profile: `{ data: AuthUser }`
Verify OTP: `{ data: { user: AuthUser, accessToken: string, role: string } }`

---

## Contributions

| Method | Endpoint | Purpose | Service File |
|--------|----------|---------|-------------|
| GET | `/contributions/my` | Get current user's contributions | `contribution.service.ts` |
| GET | `/contributions/:id` | Get single contribution by ID | `contribution.service.ts` |

**Expected Response:**
`{ data: Contribution[] }`
`{ data: Contribution }`

---

## Payments

| Method | Endpoint | Purpose | Service File |
|--------|----------|---------|-------------|
| GET | `/payments/history?page=&limit=` | Payment history (paginated) | `payment.service.ts` |
| POST | `/payments/initiate` | Initiate a payment (card or bank transfer) | `payment.service.ts` |
| GET | `/payments/receipt/:reference` | Download receipt PDF (blob) | `receipt.service.ts` |

**Initiate Payment Payload:**
```json
{ "contributionId": "string", "paymentMethod": "card" | "bank_transfer", "amount": number }
```

**Initiate Payment Response:**
```json
{
  "data": {
    "paymentId": "string",
    "reference": "string",
    "checkoutUrl": "string | null",
    "virtualAccount": {
      "accountNumber": "string",
      "accountName": "string",
      "bankName": "string",
      "amount": number
    } | null
  }
}
```

**Payment History Response:**
```json
{
  "data": {
    "items": [Payment],
    "pagination": { "page": number, "limit": number, "total": number, "totalPages": number, "hasNext": boolean, "hasPrev": boolean }
  }
}
```

---

## Groups / Cooperatives

| Method | Endpoint | Purpose | Service File |
|--------|----------|---------|-------------|
| GET | `/groups` | List all groups (for member/group-admin) | `cooperative.service.ts` |
| GET | `/groups/:id/members` | List members of a group | `group-members.service.ts` |
| GET | `/groups/:id/settings` | Get group settings | `group-settings.service.ts` |
| PUT | `/groups/:id/settings` | Update group settings | `group-settings.service.ts` |
| GET | `/groups/:id/analytics` | Group dashboard analytics | `analytics.service.ts` |
| POST | `/groups/:id/payouts` | Request a payout | `payout.service.ts` |

**Expected Response:**
Groups: `{ data: Cooperative[] }`
Members: `{ data: GroupMember[] }`
Settings: `{ data: GroupSettings }`
Analytics: `{ data: DashboardAnalytics }`

---

## Payouts

| Method | Endpoint | Purpose | Service File |
|--------|----------|---------|-------------|
| GET | `/payouts` | Get all payouts | `payout.service.ts` |

---

## Virtual Accounts

| Method | Endpoint | Purpose | Service File |
|--------|----------|---------|-------------|
| GET | `/virtual-accounts/my` | Get current user's virtual account | `virtual-account.service.ts` |
| POST | `/virtual-accounts` | Create a new virtual account | `virtual-account.service.ts` |

**Expected Response:**
`{ data: VirtualAccount | null }`
`{ data: VirtualAccount }`

**VirtualAccount shape:**
```json
{
  "id": "string",
  "accountNumber": "string",
  "accountName": "string",
  "bankName": "string",
  "providerReference": "string",
  "status": "string",
  "createdAt": "string"
}
```

---

## Notifications

| Method | Endpoint | Purpose | Service File |
|--------|----------|---------|-------------|
| GET | `/notifications` | Get user notifications | `notification.service.ts` |
| GET | `/notifications/sse` | SSE stream for real-time notifications | `use-realtime.ts` |
| GET | `/admin/settings/notifications` | Get notification settings (admin) | `notification.service.ts` |
| PATCH | `/admin/settings/notifications` | Update notification settings (admin) | `notification.service.ts` |

---

## Transactions

| Method | Endpoint | Purpose | Service File |
|--------|----------|---------|-------------|
| GET | `/transactions` | Get all transactions | `transaction.service.ts` |

---

## Withdrawals

| Method | Endpoint | Purpose | Service File |
|--------|----------|---------|-------------|
| GET | `/withdrawals` | Get all withdrawals | `withdrawal.service.ts` |
| POST | `/withdrawals/:id/approve` | Approve a withdrawal | `withdrawal.service.ts` |
| POST | `/withdrawals/:id/reject` | Reject a withdrawal | `withdrawal.service.ts` |

---

## Admin Endpoints

| Method | Endpoint | Purpose | Service File |
|--------|----------|---------|-------------|
| GET | `/admin/dashboard` | Platform analytics | `analytics.service.ts` |
| GET | `/admin/users` | List all users (also used for KYC) | `user.service.ts`, `kyc.service.ts` |
| PATCH | `/admin/users/:id/verify` | Approve KYC for a user | `kyc.service.ts` |
| PATCH | `/admin/users/:id/status` | Update user status (reject KYC) | `kyc.service.ts` |
| GET | `/admin/audit-logs` | Platform audit logs | `audit.service.ts` |
| GET | `/admin/disputes` | List disputes | `dispute.service.ts` |
| POST | `/admin/disputes/:id/resolve` | Resolve a dispute | `dispute.service.ts` |
| GET | `/admin/payment-config` | Payment gateway configuration | `payment-config.service.ts` |

---

## Analytics

| Method | Endpoint | Purpose | Service File |
|--------|----------|---------|-------------|
| GET | `/analytics/groups/:id/payments` | Payment analytics for a group | `payment-analytics.service.ts` |
| GET | `/analytics/mine/payments` | Payment analytics for current member | `payment-analytics.service.ts` |

---

## Contact

| Method | Endpoint | Purpose | Service File |
|--------|----------|---------|-------------|
| POST | `/contact` | Submit contact form | `contact.service.ts` |

---

## Required Backend Response Wrapper

Every successful API response from the backend is expected to follow this structure:

```json
{
  "data": <payload>
}
```

The frontend extracts `response.data.data` in every service function.

The only exceptions are:
- `/auth/refresh` — returns `{ accessToken: "..." }` directly OR nested inside `data`
- `/payments/receipt/:reference` — returns a binary blob (PDF)
