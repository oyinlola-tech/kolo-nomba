# Features

Kolo is organized around three user roles, each with a tailored set of features and dashboards.

---

## General Features (All Roles)

### Authentication & Security
- **Email & Password Registration** — Secure registration with Argon2 password hashing
- **Email OTP Verification** — New accounts require email verification before activation
- **Device-Aware Login** — Unknown devices trigger email OTP challenge before token issuance
- **JWT Access Tokens** — Short-lived (15 min) access tokens stored in-memory
- **HttpOnly Refresh Cookies** — Long-lived (7 day) refresh tokens as secure cookies
- **Rate Limiting** — Per-endpoint rate limits for auth, OTP, and sensitive operations
- **Password Strength Validation** — Minimum 12 characters, mixed-case, numbers, special chars

### Notifications
- **In-App Notifications** — Real-time notification center
- **Email Notifications** — Transaction confirmations, security alerts, reminders
- **Notification Preferences** — Per-user channel and type preferences
- **Delivery Tracking** — Full delivery status with retry logic

### Audit Logging
- **Security Events** — Login attempts, password changes, permission changes
- **Financial Operations** — All payment, payout, and transfer events
- **Admin Actions** — All super admin and group admin operations

---

## Super Admin Features

### Platform Management
- **Dashboard** — Real-time platform metrics (users, groups, transactions, revenue)
- **User Management** — View, search, suspend, or activate users
- **Group Management** — View all groups, monitor activity, manage status
- **Transaction Oversight** — Browse all financial transactions across the platform
- **Revenue Analytics** — Platform fee earnings, growth trends, revenue reports

### Security & Compliance
- **Verification Queue** — Review and approve user verifications
- **Security Events** — Monitor suspicious activity across the platform
- **Dispute Management** — Handle payment disputes
- **Audit Logs** — Full audit trail of platform operations

### Nomba Monitoring
- **Provider Status** — Check Nomba API connectivity
- **Transaction Logs** — View Nomba-side transactions
- **Webhook Events** — Monitor incoming webhooks
- **Failed Payments** — Review and retry failed payments
- **Reconciliation** — Match provider records with internal records

### Settings
- **Platform Settings** — Configure fee structures, limits, and policies
- **Notification Templates** — Manage system-wide notification templates
- **Background Jobs** — Monitor and retry queue workers

---

## Group Admin Features

### Group Management
- **Create Groups** — Set up savings groups with custom rules
- **Member Management** — Invite, approve, remove members
- **Group Settings** — Configure group name, description, category
- **Reports** — Contribution and payout reports

### Contribution Management
- **Create Plans** — Set contribution amounts, frequency (daily/weekly/monthly), duration
- **Track Cycles** — Monitor contribution cycles and member compliance
- **Reminders** — Automatic payment reminders for overdue members
- **Dashboard** — Group contribution analytics and member status

### Payout Management
- **Create Payouts** — Initiate payouts to members
- **Approval Workflow** — Multi-step approval process
- **Schedule Payouts** — Recurring payout schedules
- **Bulk Transfers** — Process multiple recipient payouts at once
- **Transfer Receipts** — Generate and download receipts

### Financial Oversight
- **Group Wallet** — View group balance and transaction history
- **Ledger Entries** — Full double-entry ledger for the group
- **Transaction History** — All group financial activity

---

## Member Features

### Dashboard
- **Home Overview** — Active groups, pending contributions, upcoming payouts
- **Savings Progress** — Visual tracking of savings goals

### Groups
- **Browse & Join** — Discover and request to join groups
- **Group Details** — View group information, members, and contribution schedule
- **Member Directory** — See fellow group members

### Payments & Contributions
- **Make Payments** — Three payment methods:
  - **Nomba Wallet** — Pay via Nomba wallet balance
  - **Bank Transfer** — Pay via bank transfer to virtual account
  - **Card Payment** — Pay via debit/credit card
- **Payment History** — View all past payments and receipts
- **Contribution Tracking** — See contribution status per cycle

### Payouts
- **Receive Payouts** — Automatic crediting to linked bank account
- **Payout History** — View past payouts and receipts
- **Recipient Accounts** — Manage saved bank accounts

### Profile & Settings
- **Profile Management** — Update personal information
- **Password Changes** — Secure password updates
- **Notification Preferences** — Configure alert preferences

---

## Technical Features

### Security
- Argon2 password hashing
- JWT with jose library (access + refresh token pattern)
- SHA-256 hashed refresh tokens in database
- OTP attempt lockout (3 attempts, 15 min cooldown)
- OTP resend cooldown (60 seconds)
- Device fingerprinting for login challenges
- Atomic wallet operations (no race conditions)
- Webhook HMAC-SHA256 signature verification
- CORS with explicit origins (no wildcard in production)
- Helmet security headers
- Request rate limiting (global + per-route)
- Audit logging for all sensitive operations

### Performance
- BullMQ background job queue with Redis
- Prisma ORM with optimized queries
- Pino structured logging (low overhead)
- Lazy-loaded routes and components

### Reliability
- Full double-entry accounting
- Prisma transactions for multi-step operations
- Automatic retry for failed payment verification
- Webhook event deduplication
- Background job retry with exponential backoff
- Health check endpoint
