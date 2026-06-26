# Kolo Frontend API Guide

## Base URL

```
Development: http://localhost:4000/api/v1
Production:  https://your-domain.com/api/v1
```

## Authentication Flow

### Register

```
POST /auth/register
```

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+2348012345678",
  "password": "secure-password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Created",
  "data": {
    "user": { "id": "uuid", "firstName": "John", "lastName": "Doe", "email": "john@example.com", "phone": "+2348012345678", "role": "MEMBER", "status": "PENDING" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "role": "MEMBER"
  }
}
```

### Login

```
POST /auth/login
```

**Request:**
```json
{
  "email": "john@example.com",
  "password": "secure-password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "user": { "id": "uuid", "firstName": "John", "lastName": "Doe", "email": "john@example.com", "phone": "+2348012345678", "role": "MEMBER", "status": "ACTIVE" },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "role": "MEMBER"
  }
}
```

## Token Handling

### Access Token
- Lifetime: **15 minutes** (900 seconds)
- Stored in memory (not localStorage)
- Sent as `Authorization: Bearer <token>` header

### Refresh Token
- Lifetime: **7 days**
- Used to obtain new access tokens when expired
- Stored in httpOnly cookie or memory (not localStorage)
- Rotated on each refresh (old token is invalidated)

### Refresh Token Flow

```
POST /auth/refresh
```

**Request:**
```json
{
  "refreshToken": "eyJ..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "expiresIn": 900
  }
}
```

### Logout

```
POST /auth/logout
Authorization: Bearer <accessToken>
```

**Request:**
```json
{
  "refreshToken": "eyJ..."
}
```

## Frontend Environment Variables

```env
VITE_API_URL=http://localhost:4000/api/v1
VITE_APP_NAME=Kolo
```

**Never expose:**
- Nomba API keys
- Database credentials
- JWT secrets
- SMTP passwords
- Any backend secret keys

## API Endpoints Summary

### Auth
| Method | Path                | Auth     | Role  | Description          |
|--------|----------------------|----------|-------|----------------------|
| POST   | /auth/register       | No       | -     | Create account       |
| POST   | /auth/login          | No       | -     | Sign in              |
| POST   | /auth/refresh        | No       | -     | Refresh tokens       |
| POST   | /auth/logout         | Yes      | Any   | Sign out             |
| GET    | /auth/me             | Yes      | Any   | Current user profile |

### Users
| Method | Path                    | Auth | Role  | Description          |
|--------|--------------------------|------|-------|----------------------|
| GET    | /users/profile           | Yes  | Any   | Get profile          |
| PATCH  | /users/profile           | Yes  | Any   | Update profile       |
| PATCH  | /users/password          | Yes  | Any   | Change password      |

### Groups
| Method | Path                          | Auth | Role       | Description                |
|--------|--------------------------------|------|------------|----------------------------|
| POST   | /groups                       | Yes  | Any        | Create group               |
| GET    | /groups                       | Yes  | Any        | List user's groups         |
| GET    | /groups/:id                   | Yes  | Member     | Get group details          |
| PATCH  | /groups/:id                   | Yes  | Admin/Owner| Update group               |
| DELETE | /groups/:id                   | Yes  | Owner      | Delete group               |
| POST   | /groups/:id/invite            | Yes  | Admin/Owner| Invite member              |
| POST   | /groups/invitations/:id/accept| Yes  | Any        | Accept invitation          |
| GET    | /groups/:id/members           | Yes  | Member     | List group members         |
| GET    | /groups/:id/invitations       | Yes  | Admin/Owner| List pending invitations   |
| DELETE | /groups/:id/members/:memberId| Yes  | Admin/Owner| Remove member              |

### Contributions
| Method | Path                                          | Auth | Role       | Description                    |
|--------|------------------------------------------------|------|------------|--------------------------------|
| POST   | /contributions/plans                          | Yes  | Admin/Owner| Create contribution plan       |
| GET    | /contributions/plans                          | Yes  | Any        | List plans                     |
| GET    | /contributions/plans/:id                      | Yes  | Member     | Get plan details               |
| PATCH  | /contributions/plans/:id                      | Yes  | Admin/Owner| Update plan                    |
| GET    | /contributions/plans/:id/cycles               | Yes  | Member     | List plan cycles               |
| POST   | /contributions/plans/:id/start                | Yes  | Admin/Owner| Start plan                     |
| POST   | /contributions/plans/:id/pause                | Yes  | Admin/Owner| Pause plan                     |
| GET    | /contributions/dashboard                      | Yes  | Any        | Dashboard data                 |
| GET    | /contributions/history                        | Yes  | Any        | User contribution history      |
| GET    | /contributions/groups/:groupId                | Yes  | Member     | Group contribution history     |

### Payments
| Method | Path                        | Auth | Role   | Description              |
|--------|------------------------------|------|--------|--------------------------|
| POST   | /payments                    | Yes  | Any    | Initiate payment         |
| GET    | /payments/:id                | Yes  | Any    | Get payment details      |
| GET    | /payments                    | Yes  | Any    | List payments            |
| POST   | /webhooks/nomba              | No   | -      | Nomba webhook receiver   |

### Wallet
| Method | Path                          | Auth | Role   | Description              |
|--------|--------------------------------|------|--------|--------------------------|
| GET    | /wallets/:id                   | Yes  | Any    | Get wallet balance       |
| GET    | /wallets                       | Yes  | Any    | List wallets             |
| POST   | /wallets/transfer              | Yes  | Any    | Transfer between wallets |

### Ledger
| Method | Path                          | Auth | Role       | Description              |
|--------|--------------------------------|------|------------|--------------------------|
| GET    | /ledger/entries               | Yes  | Any        | List ledger entries      |

### Payouts
| Method | Path                              | Auth | Role       | Description                |
|--------|------------------------------------|------|------------|----------------------------|
| POST   | /payouts                          | Yes  | Admin/Owner| Request payout             |
| GET    | /payouts                          | Yes  | Any        | List payouts               |
| GET    | /payouts/:id                      | Yes  | Any        | Get payout details         |
| PATCH  | /payouts/:id/approve              | Yes  | Admin/Owner| Approve payout             |
| PATCH  | /payouts/:id/reject               | Yes  | Admin/Owner| Reject payout              |
| POST   | /payouts/:id/process              | Yes  | Admin/Owner| Process payout             |

### Withdrawals
| Method | Path                              | Auth | Role   | Description                |
|--------|------------------------------------|------|--------|----------------------------|
| POST   | /withdrawals                      | Yes  | Any    | Request withdrawal         |
| GET    | /withdrawals                      | Yes  | Any    | List withdrawals           |
| GET    | /withdrawals/:id                  | Yes  | Any    | Get withdrawal details     |

### Notifications
| Method | Path                                           | Auth | Role   | Description                      |
|--------|-------------------------------------------------|------|--------|----------------------------------|
| GET    | /notifications                                  | Yes  | Any    | List notifications               |
| GET    | /notifications/unread                           | Yes  | Any    | List unread notifications        |
| PATCH  | /notifications/:id/read                         | Yes  | Any    | Mark notification as read        |
| PATCH  | /notifications/read-all                         | Yes  | Any    | Mark all as read                 |
| GET    | /notifications/preferences                      | Yes  | Any    | Get notification preferences     |
| PATCH  | /notifications/preferences                      | Yes  | Any    | Update preferences               |
| GET    | /notifications/:notificationId/deliveries       | Yes  | Any    | Get delivery records             |
| POST   | /notifications/retry-failed                     | Yes  | Any    | Retry failed deliveries          |

### Admin
| Method | Path                                  | Auth | Role        | Description                  |
|--------|----------------------------------------|------|-------------|------------------------------|
| GET    | /admin/dashboard                       | Yes  | SUPER_ADMIN | Platform dashboard metrics   |
| GET    | /admin/revenue                         | Yes  | SUPER_ADMIN | Revenue analytics            |
| GET    | /admin/users                           | Yes  | SUPER_ADMIN | List users (paginated)       |
| GET    | /admin/users/:id                       | Yes  | SUPER_ADMIN | Get user details             |
| PATCH  | /admin/users/:id/status                | Yes  | SUPER_ADMIN | Update user status           |
| GET    | /admin/groups                          | Yes  | SUPER_ADMIN | List all groups (paginated)  |
| GET    | /admin/groups/:id                      | Yes  | SUPER_ADMIN | Get group details            |
| GET    | /admin/transactions                    | Yes  | SUPER_ADMIN | List transactions (paginated)|
| GET    | /admin/transactions/:id                | Yes  | SUPER_ADMIN | Get transaction details      |
| GET    | /admin/withdrawals                     | Yes  | SUPER_ADMIN | List withdrawals (paginated) |
| PATCH  | /admin/withdrawals/:id/status          | Yes  | SUPER_ADMIN | Update withdrawal status     |
| GET    | /admin/audit-logs                      | Yes  | SUPER_ADMIN | List audit logs (paginated)  |
| GET    | /admin/security-events                 | Yes  | SUPER_ADMIN | List security events         |
| GET    | /admin/notifications                   | Yes  | SUPER_ADMIN | Platform notifications       |
| POST   | /admin/notifications                   | Yes  | SUPER_ADMIN | Send platform notification   |

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "message": "Invalid email or password",
  "errorCode": "INVALID_CREDENTIALS",
  "errors": ["email: Email is required"]
}
```

### Standard Error Codes

| Code                    | HTTP Status | Description                        |
|-------------------------|-------------|------------------------------------|
| INVALID_CREDENTIALS     | 401         | Wrong email or password            |
| UNAUTHORIZED            | 401         | Missing or invalid token           |
| FORBIDDEN               | 403         | Insufficient role permissions      |
| RESOURCE_NOT_FOUND      | 404         | Requested resource does not exist  |
| VALIDATION_ERROR        | 400         | Request body validation failed     |
| PAYMENT_FAILED          | 402         | Payment processing failed          |
| INTERNAL_ERROR          | 500         | Unexpected server error            |
| RATE_LIMIT              | 429         | Too many requests                  |
| TOKEN_EXPIRED           | 401         | Token has expired                  |
| ACCOUNT_INACTIVE        | 403         | Account is suspended or inactive   |
| DUPLICATE_ENTRY         | 409         | Resource already exists            |
| INSUFFICIENT_FUNDS      | 400         | Not enough balance                 |

## Pagination

All list endpoints support:

| Query Param | Type   | Default | Description                  |
|-------------|--------|---------|------------------------------|
| page        | number | 1       | Page number (starts at 1)    |
| limit       | number | 20      | Items per page (max 100)     |
| search      | string | -       | Search term                  |
| sort        | string | -       | Field to sort by             |
| order       | string | asc     | Sort direction (asc or desc) |

**Paginated Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## Role-Based Access

| Role          | Access                                                      |
|---------------|-------------------------------------------------------------|
| SUPER_ADMIN   | Full platform access — all admin and management endpoints   |
| GROUP_ADMIN   | Management of assigned groups — members, contributions, etc |
| MEMBER        | Personal data only — own profile, groups, payments          |

Role checks are enforced server-side via middleware. Never rely on client-side role checks for security.
