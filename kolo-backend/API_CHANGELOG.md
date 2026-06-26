# Kolo API Changelog

## v1.0.0 (Initial Release)

### Authentication

| Endpoint               | Method | Status     |
|------------------------|--------|------------|
| /api/v1/auth/register  | POST   | Active     |
| /api/v1/auth/login     | POST   | Active     |
| /api/v1/auth/refresh   | POST   | Active     |
| /api/v1/auth/logout    | POST   | Active     |
| /api/v1/auth/me        | GET    | Active     |

### Users

| Endpoint                     | Method | Status     |
|------------------------------|--------|------------|
| /api/v1/users/profile        | GET    | Active     |
| /api/v1/users/profile        | PATCH  | Active     |
| /api/v1/users/password       | PATCH  | Active     |

### Groups

| Endpoint                                        | Method | Status     |
|-------------------------------------------------|--------|------------|
| /api/v1/groups                                  | POST   | Active     |
| /api/v1/groups                                  | GET    | Active     |
| /api/v1/groups/:id                              | GET    | Active     |
| /api/v1/groups/:id                              | PATCH  | Active     |
| /api/v1/groups/:id                              | DELETE | Active     |
| /api/v1/groups/:id/invite                       | POST   | Active     |
| /api/v1/groups/invitations/:id/accept            | POST   | Active     |
| /api/v1/groups/:id/members                      | GET    | Active     |
| /api/v1/groups/:id/invitations                  | GET    | Active     |
| /api/v1/groups/:id/members/:memberId            | DELETE | Active     |

### Contributions

| Endpoint                                            | Method | Status     |
|-----------------------------------------------------|--------|------------|
| /api/v1/contributions/plans                         | POST   | Active     |
| /api/v1/contributions/plans                         | GET    | Active     |
| /api/v1/contributions/plans/:id                     | GET    | Active     |
| /api/v1/contributions/plans/:id                     | PATCH  | Active     |
| /api/v1/contributions/plans/:id/cycles              | GET    | Active     |
| /api/v1/contributions/plans/:id/start               | POST   | Active     |
| /api/v1/contributions/plans/:id/pause               | POST   | Active     |
| /api/v1/contributions/dashboard                     | GET    | Active     |
| /api/v1/contributions/history                       | GET    | Active     |
| /api/v1/contributions/groups/:groupId               | GET    | Active     |

### Payments

| Endpoint                     | Method | Status     |
|------------------------------|--------|------------|
| /api/v1/payments             | POST   | Active     |
| /api/v1/payments/:id         | GET    | Active     |
| /api/v1/payments             | GET    | Active     |

### Webhooks

| Endpoint                | Method | Status     |
|-------------------------|--------|------------|
| /api/v1/webhooks/nomba  | POST   | Active     |

### Wallets

| Endpoint                        | Method | Status     |
|---------------------------------|--------|------------|
| /api/v1/wallets/:id             | GET    | Active     |
| /api/v1/wallets                 | GET    | Active     |
| /api/v1/wallets/transfer        | POST   | Active     |

### Ledger

| Endpoint                | Method | Status     |
|-------------------------|--------|------------|
| /api/v1/ledger/entries  | GET    | Active     |

### Payouts

| Endpoint                       | Method | Status     |
|--------------------------------|--------|------------|
| /api/v1/payouts                | POST   | Active     |
| /api/v1/payouts                | GET    | Active     |
| /api/v1/payouts/:id            | GET    | Active     |
| /api/v1/payouts/:id/approve    | PATCH  | Active     |
| /api/v1/payouts/:id/reject     | PATCH  | Active     |
| /api/v1/payouts/:id/process    | POST   | Active     |

### Withdrawals

| Endpoint                       | Method | Status     |
|--------------------------------|--------|------------|
| /api/v1/withdrawals            | POST   | Active     |
| /api/v1/withdrawals            | GET    | Active     |
| /api/v1/withdrawals/:id        | GET    | Active     |

### Notifications

| Endpoint                                              | Method | Status     |
|-------------------------------------------------------|--------|------------|
| /api/v1/notifications                                 | GET    | Active     |
| /api/v1/notifications/unread                          | GET    | Active     |
| /api/v1/notifications/:id/read                        | PATCH  | Active     |
| /api/v1/notifications/read-all                        | PATCH  | Active     |
| /api/v1/notifications/preferences                     | GET    | Active     |
| /api/v1/notifications/preferences                     | PATCH  | Active     |
| /api/v1/notifications/:notificationId/deliveries      | GET    | Active     |
| /api/v1/notifications/retry-failed                    | POST   | Active     |

### Admin

| Endpoint                                 | Method | Status     |
|------------------------------------------|--------|------------|
| /api/v1/admin/dashboard                  | GET    | Active     |
| /api/v1/admin/revenue                    | GET    | Active     |
| /api/v1/admin/users                      | GET    | Active     |
| /api/v1/admin/users/:id                  | GET    | Active     |
| /api/v1/admin/users/:id/status           | PATCH  | Active     |
| /api/v1/admin/groups                     | GET    | Active     |
| /api/v1/admin/groups/:id                 | GET    | Active     |
| /api/v1/admin/transactions               | GET    | Active     |
| /api/v1/admin/transactions/:id           | GET    | Active     |
| /api/v1/admin/withdrawals                | GET    | Active     |
| /api/v1/admin/withdrawals/:id/status     | PATCH  | Active     |
| /api/v1/admin/audit-logs                 | GET    | Active     |
| /api/v1/admin/security-events            | GET    | Active     |
| /api/v1/admin/notifications              | GET    | Active     |
| /api/v1/admin/notifications              | POST   | Active     |

### Health

| Endpoint              | Method | Status     |
|-----------------------|--------|------------|
| /api/v1/health        | GET    | Active     |

## Deprecated Endpoints

None at this time.

## Upcoming (v2 plans)

None scheduled.

## Versioning

Current: `/api/v1/`

Structure maintained for future `/api/v2/` endpoints alongside v1.
