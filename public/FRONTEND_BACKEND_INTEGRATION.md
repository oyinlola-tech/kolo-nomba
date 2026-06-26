# Kolo Frontend-Backend Integration

## API Base URL

```
https://api-kolo.telente.site/api/v1
```

Configured via `VITE_API_URL` in `.env`.

## Authentication Flow

1. User submits credentials via `POST /auth/login`
2. Backend returns `{ user, accessToken, refreshToken, role }`
3. Tokens stored in `localStorage` (`kolo.accessToken`, `kolo.refreshToken`, `kolo.user`)
4. API client attaches `Authorization: Bearer <token>` to all requests
5. On 401 response, client attempts token refresh via `POST /auth/refresh`
6. If refresh fails, user is redirected to `/login`

### Token Refresh

The API client (`src/api/client.ts`) implements automatic refresh token rotation:
- Queues concurrent 401 requests while a refresh is in progress
- Updates stored tokens on successful refresh
- Clears session and redirects on refresh failure

### Route Protection

Routes are protected by `ProtectedRoute` component in `src/components/shared/ProtectedRoute.tsx`:
- `/ajo/admin/*` - Requires SUPER_ADMIN role
- `/group/admin/*` - Requires GROUP_ADMIN role
- `/member/*` - Requires MEMBER role (also allows GROUP_ADMIN/SUPER_ADMIN)

## Role Mapping

| Backend Role | Frontend Type | Dashboard Route |
|---|---|---|
| `SUPER_ADMIN` | `"SUPER_ADMIN"` | `/ajo/admin/*` |
| `GROUP_ADMIN` | `"GROUP_ADMIN"` | `/group/admin/*` |
| `MEMBER` | `"MEMBER"` | `/member/*` |

## Available Endpoints

### Authentication
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login with email/password |
| POST | `/auth/refresh` | No | Refresh access token |
| POST | `/auth/logout` | Yes | Logout and invalidate session |
| GET | `/auth/me` | Yes | Get current user profile |

### Users
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/users/profile` | Yes | Get own profile |
| PATCH | `/users/profile` | Yes | Update own profile |
| PATCH | `/users/password` | Yes | Change password |

### Groups
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/groups` | Yes | Create group |
| GET | `/groups` | Yes | List user's groups |
| GET | `/groups/invitations` | Yes | List pending invitations |
| GET | `/groups/:id` | Yes | Get group details |
| PATCH | `/groups/:id` | Yes | Update group |
| DELETE | `/groups/:id` | Yes | Delete group |
| POST | `/groups/:id/members/invite` | Yes | Invite member |
| POST | `/groups/invitations/accept` | Yes | Accept invitation |
| GET | `/groups/:id/members` | Yes | List group members |
| GET | `/groups/:id/invitations` | Yes | List group invitations |
| DELETE | `/groups/:id/members/:memberId` | Yes | Remove member |

### Contributions
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/groups/:groupId/contribution-plans` | Yes | Create plan |
| GET | `/groups/:groupId/contribution-plans` | Yes | List plans |
| GET | `/contribution-plans/:id` | Yes | Get plan |
| PATCH | `/contribution-plans/:id` | Yes | Update plan |
| DELETE | `/contribution-plans/:id` | Yes | Delete plan |
| GET | `/contribution-plans/:id/cycles` | Yes | List cycles |
| GET | `/contribution-cycles/:id` | Yes | Get cycle |
| GET | `/contribution-cycles/:id/dashboard` | Yes | Cycle dashboard |
| GET | `/contributions/my` | Yes | My contributions |
| GET | `/groups/:groupId/contributions` | Yes | Group contributions |
| GET | `/contributions/:id` | Yes | Get contribution |

### Payments
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/payments/initiate` | Yes | Initiate payment |
| GET | `/payments/history` | Yes | Payment history |
| GET | `/payments/:id` | Yes | Get payment |
| GET | `/contributions/:id/payments` | Yes | Contribution payments |

### Payouts
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/groups/:groupId/payouts` | Yes | Create payout |
| GET | `/groups/:groupId/payouts` | Yes | List group payouts |
| GET | `/payouts/:id` | Yes | Get payout |
| GET | `/payouts` | Yes | User's payouts |
| PATCH | `/payouts/:id/approve` | Yes | Approve payout |
| PATCH | `/payouts/:id/reject` | Yes | Reject payout |
| PATCH | `/payouts/:id/cancel` | Yes | Cancel payout |
| POST | `/payouts/:id/process` | Yes | Process payout |
| POST | `/payouts/recipients/:recipientId/retry` | Yes | Retry failed transfer |
| GET | `/payouts/recipients/:recipientId/receipt` | Yes | Get receipt |
| POST | `/groups/:groupId/payout-schedules` | Yes | Create schedule |
| GET | `/groups/:groupId/payout-schedules` | Yes | List schedules |
| PATCH | `/payout-schedules/:scheduleId/pause` | Yes | Pause schedule |
| POST | `/payout-accounts` | Yes | Create recipient account |
| GET | `/payout-accounts` | Yes | List recipient accounts |

### Withdrawals
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/withdrawals` | Yes | Create withdrawal |
| GET | `/withdrawals` | Yes | List withdrawals |
| GET | `/withdrawals/:id` | Yes | Get withdrawal |
| POST | `/withdrawals/:id/approve` | SUPER_ADMIN | Approve withdrawal |
| POST | `/withdrawals/:id/reject` | SUPER_ADMIN | Reject withdrawal |

### Wallets
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/wallets/:id` | Yes | Get wallet |
| GET | `/wallets/:id/balance` | Yes | Get balance |
| POST | `/wallets/transfer` | Yes | Transfer between wallets |

### Notifications
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/notifications` | Yes | List notifications |
| GET | `/notifications/unread` | Yes | Unread count |
| PATCH | `/notifications/:id/read` | Yes | Mark as read |
| PATCH | `/notifications/read-all` | Yes | Mark all as read |
| GET | `/notifications/preferences` | Yes | Get preferences |
| PATCH | `/notifications/preferences` | Yes | Update preferences |
| GET | `/notifications/:notificationId/deliveries` | Yes | Delivery records |
| POST | `/notifications/retry-failed` | Yes | Retry failed deliveries |

### Admin (SUPER_ADMIN only)
| Method | Path | Description |
|---|---|---|
| GET | `/admin/dashboard` | Dashboard metrics + charts |
| GET | `/admin/users` | List all users |
| GET | `/admin/users/:id` | Get user |
| PATCH | `/admin/users/:id/status` | Update user status |
| PATCH | `/admin/users/:id/verify` | Verify user |
| GET | `/admin/groups` | List all groups |
| GET | `/admin/groups/:id` | Get group |
| PATCH | `/admin/groups/:id/status` | Update group status |
| GET | `/admin/transactions` | List transactions |
| GET | `/admin/transactions/:id` | Get transaction |
| GET | `/admin/revenue` | Revenue analytics |
| GET | `/admin/withdrawals` | List withdrawals |
| PATCH | `/admin/withdrawals/:id/status` | Update withdrawal status |
| GET | `/admin/security/events` | Security events |
| GET | `/admin/audit-logs` | Audit logs |
| GET | `/admin/settings/notifications` | Get notification settings |
| PATCH | `/admin/settings/notifications` | Update notification settings |
| GET | `/admin/jobs` | Background jobs |
| GET | `/admin/jobs/:id` | Job details |
| POST | `/admin/jobs/:id/retry` | Retry job |
| GET | `/admin/jobs/queue-stats` | Queue statistics |

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000` | Backend API base URL |
| `VITE_APP_NAME` | `Kolo` | Application name |

## Feature Mapping

| Frontend Page | Backend Endpoint(s) |
|---|---|
| Landing | Static content (no API) |
| Login | `POST /auth/login` |
| Register | `POST /auth/register` |
| SA Dashboard | `GET /admin/dashboard` |
| SA Users | `GET /admin/users` |
| SA Groups | `GET /admin/groups` |
| SA Transactions | `GET /admin/transactions` |
| SA Payments | `GET /payments/history` |
| SA Revenue | `GET /admin/revenue` |
| SA Withdrawals | `GET /admin/withdrawals` |
| SA Disputes | `GET /admin/users` (KYC verification) |
| SA Verification | `GET /admin/users` (user verification) |
| SA Notifications | `GET /notifications` |
| SA Security | `GET /admin/security/events`, `GET /admin/audit-logs` |
| SA Settings | `GET/PATCH /admin/settings/notifications` |
| GA Dashboard | `GET /groups`, `GET /contributions/my` |
| GA Members | `GET /groups/:id/members` |
| GA Contributions | `GET /groups/:groupId/contributions` |
| GA Transactions | `GET /transactions` |
| GA Payouts | `GET /payouts` |
| GA Reports | `GET /admin/dashboard` |
| GA Notifications | `GET /notifications` |
| GA Settings | `GET /groups/:id` |
| Member Home | `GET /auth/me`, `GET /groups`, `GET /contributions/my` |
| Member Groups | `GET /groups` |
| Member Group Detail | `GET /groups/:id` |
| Member Pay | `POST /payments/initiate` |
| Member History | `GET /contributions/my` |
| Member Notifications | `GET /notifications` |
| Member Profile | `GET /auth/me` |

## Missing Features Added

### Backend

1. **Platform Settings System** (`PlatformSetting` model)
   - Repository: `src/repositories/platform-setting.repository.ts`
   - Service: `src/services/platform-setting.service.ts`
   - Endpoints: `GET/PATCH /admin/settings/notifications`
   - Database settings override environment defaults

2. **Group Members Listing** (fix)
   - `GET /groups/:id/members` now returns active members (was incorrectly returning invitations)
   - Added `GET /groups/:id/invitations` for admin invitation listing
   - New `GroupService.getGroupMembers()` method

3. **Withdrawal Approve/Reject**
   - `POST /withdrawals/:id/approve` (SUPER_ADMIN only)
   - `POST /withdrawals/:id/reject` (SUPER_ADMIN only)

4. **Channel Resolver Update**
   - Now checks `PlatformSettingService.getNotificationSettings()` before sending
   - Database settings take priority over environment defaults
   - Security emails always enabled regardless of settings

### Frontend

1. **API Client** - Refresh token rotation on 401
2. **Auth** - Login/Register connected to real API
3. **Route Guards** - ProtectedRoute with role-based access
4. **Settings Page** - Super Admin communication toggles (SMS/Email/WhatsApp)
5. **Auth Types** - Updated to match backend response format
6. **Service Endpoints** - All services updated to match backend paths

## Platform Settings Priority

1. Database `platform_settings` table (admin-configured)
2. `.env` environment variables (defaults)

Notification flow:
```
Event → NotificationService → ChannelResolver
  → Checks PlatformSetting (DB)
  → Checks User Preferences
  → Sends via enabled channel
```
