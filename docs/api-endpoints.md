# API Endpoints Reference

Complete API reference for all Kolo endpoints.

**Base URL**: `/api/v1`

---

## Authentication

### POST /auth/register
Create a new account. Returns userId for OTP verification.

**Body:**
```json
{
  "firstName": "Chioma",
  "lastName": "Okafor",
  "email": "chioma@example.com",
  "phone": "+2348012345678",
  "password": "SecurePass123!"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Account created. Verification code sent.",
  "data": { "userId": "uuid" }
}
```

### POST /auth/verify-otp
Verify email OTP after registration. Activates user and returns tokens.

**Body:**
```json
{ "userId": "uuid", "code": "123456" }
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "firstName": "Chioma", "role": "MEMBER" },
    "accessToken": "jwt...",
    "role": "MEMBER"
  }
}
```

### POST /auth/resend-otp
Resend verification OTP (60s cooldown).

**Body:**
```json
{ "userId": "uuid" }
```

**Response (200):**
```json
{ "success": true, "message": "Verification code resent" }
```

### POST /auth/login
Login with email and password. May return OTP challenge for unknown devices.

**Body:**
```json
{ "email": "chioma@example.com", "password": "SecurePass123!" }
```

**Response (known device):**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "firstName": "Chioma", "role": "MEMBER" },
    "accessToken": "jwt...",
    "role": "MEMBER"
  }
}
```

**Response (unknown device):**
```json
{
  "success": true,
  "data": {
    "challengeId": "uuid",
    "email": "c***@example.com",
    "type": "login_challenge"
  }
}
```

### POST /auth/verify-login-otp
Verify login OTP for unknown device. Returns tokens.

**Body:**
```json
{ "userId": "uuid", "code": "123456" }
```

**Response:** Same as login success.

### POST /auth/refresh
Refresh access token using HttpOnly cookie. No body required.

**Response (200):**
```json
{
  "success": true,
  "data": { "accessToken": "new-jwt..." }
}
```

### POST /auth/logout
Clear session and refresh cookie.

### GET /auth/me
Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid", "firstName": "Chioma", "lastName": "Okafor",
    "email": "chioma@example.com", "phone": "+2348012345678",
    "role": "MEMBER", "status": "ACTIVE"
  }
}
```

---

## Users

All endpoints require authentication.

### GET /users/profile
Get own profile.

### PATCH /users/profile
Update own profile.

**Body:** `{ firstName?, lastName?, email?, phone? }`

### PATCH /users/password
Update password.

**Body:** `{ currentPassword: string, newPassword: string }`

### GET /users/:id
Get user by ID (admin only).

---

## Groups

All endpoints require authentication.

### POST /groups
Create a new group.

**Body:** `{ name: string, description?: string, category?: string, location?: string }`

### GET /groups
List user's groups.

### GET /groups/:id
Get group details.

### PATCH /groups/:id
Update group (admin/owner only).

### DELETE /groups/:id
Delete group (owner only).

### POST /groups/:id/invite
Invite members (admin only).

**Body:** `{ email?: string, phone?: string }`

### GET /groups/:id/members
List group members.

### PATCH /groups/:id/members/:memberId/role
Update member role (owner only).

### DELETE /groups/:id/members/:memberId
Remove member (admin only).

### POST /groups/:id/join
Request to join a public group.

---

## Contribution Plans

### POST /contribution-plans
Create a contribution plan (group admin required).

**Body:**
```json
{
  "groupId": "uuid",
  "name": "Trip Fund",
  "amount": 500000,
  "frequency": "WEEKLY",
  "startDate": "2026-07-01T00:00:00Z",
  "endDate": "2026-10-01T00:00:00Z"
}
```

### GET /contribution-plans/:id
Get plan details.

### PATCH /contribution-plans/:id
Update plan (group admin only).

### DELETE /contribution-plans/:id
Delete/complete plan (group admin only).

### GET /contribution-plans/:id/cycles
List cycles for a plan.

### GET /cycles/:id
Get cycle details with member contributions.

### GET /contributions/:id
Get member contribution details.

### POST /contributions/:id/pay
Initiate payment for a contribution.

---

## Payments

### POST /payments/initiate
Initiate a payment.

**Body:** `{ amount: number, contributionId?: string, paymentMethod?: string }`

### GET /payments/:id
Get payment details.

### GET /payments/history
List user's payment history.

---

## Wallets

### GET /wallets/:ownerType/:ownerId
Get wallet (user must own wallet or be super admin).

### GET /wallets/:ownerType/:ownerId/balance
Get wallet balance.

### POST /wallets/transfer
Transfer between wallets (admin/owner check applies).

**Body:** `{ sourceWalletId: string, destinationWalletId: string, amount: number }`

---

## Ledger

### GET /ledger/wallet/:walletId
Get ledger entries for a wallet (user must own wallet).

---

## Financial Transactions

### GET /financial-transactions
List user's financial transactions.

### GET /financial-transactions/:id
Get transaction details.

---

## Payouts

### POST /groups/:groupId/payouts
Create a payout (group admin required).

**Body:**
```json
{
  "amount": 1000000,
  "reason": "Cycle 1 payout",
  "type": "MANUAL",
  "recipients": [
    { "userId": "uuid", "amount": 500000, "recipientAccountId": "uuid" }
  ]
}
```

### GET /groups/:groupId/payouts
List group payouts.

### GET /payouts/:id
Get payout details.

### PATCH /payouts/:id/approve
Approve payout (group admin).

**Body:** `{ comment?: string }`

### PATCH /payouts/:id/reject
Reject payout.

**Body:** `{ comment?: string }`

### POST /payouts/:id/process
Process payout (initiate transfers).

### POST /payouts/:retry
Retry failed payout transfers.

### GET /payouts/:id/receipt
Generate transfer receipt.

### POST /groups/:groupId/schedules
Create payout schedule.

**Body:** `{ frequency: "MONTHLY", amount: 500000, dayOfMonth: 15 }`

### GET /groups/:groupId/schedules
List payout schedules.

---

## Payout Recipient Accounts

### POST /recipient-accounts
Save a new payout recipient account.

**Body:** `{ bankName: string, accountNumber: string, accountName: string }`

### GET /recipient-accounts
List user's saved accounts.

### DELETE /recipient-accounts/:id
Delete an account.

---

## Withdrawals

### POST /withdrawals
Create withdrawal request.

**Body:** `{ walletId: string, amount: number, destination?: string }`

### GET /withdrawals
List user's withdrawal requests.

### PATCH /withdrawals/:id/status
Update withdrawal status (admin).

---

## Notifications

### GET /notifications
List user's notifications.

### GET /notifications/unread
Get unread notification count.

### PATCH /notifications/:id/read
Mark as read.

### PATCH /notifications/read-all
Mark all as read.

### GET /notifications/preferences
Get notification preferences.

### PATCH /notifications/preferences
Update notification preferences.

### GET /notifications/:id/deliveries
Get delivery details for a notification.

---

## Reconciliation (Super Admin)

### GET /reconciliation
List reconciliation records.

### POST /reconciliation/:id/resolve
Resolve a reconciliation record.

**Body:** `{ status: "MATCHED" | "MISMATCHED" | "RESOLVED" }`

---

## Webhook (Provider)

### POST /webhooks/nomba
Receive Nomba webhook events (raw body captured for HMAC verification).

---

## Admin (Super Admin)

### GET /admin/dashboard
Platform dashboard metrics.

### GET /admin/users
List all users.

### GET /admin/users/:id
Get user details.

### PATCH /admin/users/:id/status
Update user status.

### PATCH /admin/users/:id/verify
Verify user.

### GET /admin/groups
List all groups.

### GET /admin/groups/:id
Get group details.

### PATCH /admin/groups/:id/status
Update group status.

### GET /admin/transactions
List all transactions.

### GET /admin/transactions/:id
Get transaction details.

### GET /admin/revenue
Revenue analytics.

### GET /admin/withdrawals
List withdrawal requests.

### PATCH /admin/withdrawals/:id/status
Update withdrawal status.

### GET /admin/security/events
List security events.

### GET /admin/settings/notifications
Get notification settings.

### PATCH /admin/settings/notifications
Update notification settings.

### GET /admin/audit-logs
List audit logs.

### GET /admin/nomba/status
Check Nomba API connectivity.

### GET /admin/nomba/transactions
View Nomba transactions.

### GET /admin/nomba/webhook-events
View webhook history.

### GET /admin/nomba/failed-payments
View failed payments.

### GET /admin/nomba/reconciliation
Get reconciliation results.

### GET /admin/jobs
List background jobs.

### GET /admin/jobs/queue-stats
Get queue statistics.

### GET /admin/jobs/:id
Get job details.

### POST /admin/jobs/:id/retry
Retry a failed job.
