# Authentication

This document explains the complete authentication system in Kolo — from registration and login to token management, OTP verification, and role-based authorization.

---

## Authentication Overview

Kolo uses a **JWT-based authentication system** with short-lived access tokens and long-lived refresh tokens stored in HttpOnly cookies.

```
┌─────────────────────────────────────────────────────────────┐
│                    Auth Architecture                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐           ┌───────────────────┐              │
│  │  Client  │           │     Server        │              │
│  │          │           │                   │              │
│  │ ● Access │  Bearer   │ ● Verify JWT      │              │
│  │   Token  │──────────▶│ ● Check expiry    │              │
│  │ (memory) │           │ ● Check user      │              │
│  │          │           │ ● Check status    │              │
│  │ ● Refresh│  Cookie   │ ● Check role      │              │
│  │   Token  │──────────▶│                   │              │
│  │ (cookie) │           │ ● Issue new tokens │              │
│  └──────────┘           └───────────────────┘              │
│                                                             │
│  Security Properties:                                       │
│  • Passwords: Argon2 hashed                                 │
│  • Sessions: SHA-256 hashed refresh tokens                  │
│  • Access tokens: 15 min expiry                             │
│  • Refresh tokens: 7 day expiry                             │
│  • No tokens in localStorage                                │
│  • Unknown devices: OTP challenge                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Registration Flow

```
1. POST /auth/register { firstName, lastName, email, phone, password }
                  │
2. Validate input (Zod schema)
                  │
3. Check duplicate email/phone → 409 if exists
                  │
4. Hash password with Argon2
                  │
5. Create User with status = PENDING
                  │
6. Generate 6-digit OTP, hash with SHA-256, store in otp_codes
                  │
7. Send OTP email via SMTP
                  │
8. Return { userId, message: "Verification code sent" }
                  │
9. POST /auth/verify-otp { userId, code }
                  │
10. Hash code, compare against stored hash
                  │
11. Check attempt count (max 3), lockout (15 min)
                  │
12. Mark OTP as used, set user status = ACTIVE
                  │
13. Generate JWT tokens, create session
                  │
14. Return { user, accessToken, refreshToken (cookie) }
```

---

## Login Flows

### Known Device Login

```
1. POST /auth/login { email, password }
                  │
2. Find user by email/phone → 404 if not found
                  │
3. Verify password (Argon2) → 401 if wrong
                  │
4. Check user status = ACTIVE → 401 if PENDING/SUSPENDED
                  │
5. Compute deviceHash = SHA-256(userAgent + IP)
                  │
6. Check for existing session with same deviceHash
                  │
7. (Known device) → Generate JWT tokens
                  │
8. Create session (store hashed refreshToken + deviceHash)
                  │
9. Set refreshToken cookie (HttpOnly, Secure, SameSite=Strict)
                  │
10. Return { user, accessToken, role }
```

### Unknown Device Login (OTP Challenge)

```
1-5. Same as known device login
                  │
6. No existing session with this deviceHash → UNKNOWN DEVICE
                  │
7. Generate 6-digit OTP, send to registered email
                  │
8. Return { challengeId: userId, email: "c***@example.com" }
                  │
9. POST /auth/verify-login-otp { userId, code }
                  │
10. Verify OTP (hash, expiry, attempts, lockout)
                  │
11. Generate JWT tokens
                  │
12. Create session with deviceHash (marks device as known)
                  │
13. Set refreshToken cookie
                  │
14. Return { user, accessToken, role }
```

---

## Token Management

### Access Token

```json
// Decoded JWT payload
{
  "sub": "user-uuid",
  "role": "MEMBER",
  "type": "access",
  "iat": 1700000000,
  "exp": 1700000900   // 15 minutes
}
```

- Signed with `JWT_SECRET` using HS256
- Contains user ID and role
- Validated on every authenticated request
- Never stored in localStorage (kept in-memory only)

### Refresh Token

```json
// Decoded JWT payload
{
  "sub": "user-uuid",
  "type": "refresh",
  "iat": 1700000000,
  "exp": 1700604800   // 7 days
}
```

- Signed with `JWT_REFRESH_SECRET` (separate from access token secret)
- Stored as **SHA-256 hash** in the `Session` database table
- Delivered via `Set-Cookie` (HttpOnly, Secure, SameSite=Strict)
- Used only at `/auth/refresh` to obtain new access tokens

### Session Management

```
Session created at login
  ├── refreshToken: SHA-256(token)
  ├── deviceHash: SHA-256(userAgent + IP)
  └── expiresAt: now + 7 days

Session refreshed at token refresh
  ├── Old session invalidated
  └── New session created

Session deleted at logout
Session cleaned up by daily cron job (expired sessions)
```

---

## OTP System

### OTP Properties

| Property | Value |
|---|---|
| Length | 6 digits |
| Characters | 0-9 only |
| Expiry | 10 minutes |
| Max attempts | 3 (per code) |
| Lockout duration | 15 minutes (after 3 failed attempts) |
| Resend cooldown | 60 seconds |
| Storage | SHA-256 hash (raw code never persisted) |
| Delivery | Email only |

### OTP Flow

```
User requests OTP
        │
Server generates 6-digit random code
        │
Server stores SHA-256(code) in otp_codes table
        │
Server sends raw code via email
        │
        │  10 minute window
        │
User submits code → Server SHA-256 hashes → compares with stored hash
        │
        ├── Match → Mark used, proceed
        └── No match → Increment attemptCount
                        ├── < 3 → "Invalid code, X attempts remaining"
                        └── ≥ 3 → Set lockedUntil = now + 15min
                                   "Too many attempts. Try again later."
```

---

## Role-Based Authorization

### Platform Roles (User.role)

| Role | Privileges |
|---|---|
| `SUPER_ADMIN` | Full platform access, manage all users/groups/settings |
| `GROUP_ADMIN` | Create/manage groups, approve payouts |
| `MEMBER` | Join groups, make contributions, receive payouts |

### Group-Level Roles (GroupMember.role)

| Role | Privileges |
|---|---|
| `GROUP_OWNER` | Full group control, can delete group |
| `GROUP_ADMIN` | Manage members, approve payouts |
| `MEMBER` | Participate in group savings |

### Authorization Enforcement

```
Route → AuthMiddleware (JWT + user status)
  → RoleMiddleware (check User.role)
    → GroupMiddleware (check GroupMember.role)
      → Controller
```

**AuthMiddleware:**
```typescript
// Verifies Bearer token, loads user, checks ACTIVE status
authenticate(request, reply, done) {
  const token = extractBearerToken(request);
  const payload = JwtUtil.verifyAccessToken(token);
  const user = await userRepository.findById(payload.sub);
  if (!user || user.status !== "ACTIVE") throw new AuthError(...);
  request.userId = user.id;
  request.userRole = user.role;
}
```

**RoleMiddleware:**
```typescript
// Checks user role against allowed roles
class RoleMiddleware {
  constructor(private allowedRoles: Role[]) {}
  authorize(request, reply, done) {
    if (!this.allowedRoles.includes(request.userRole)) {
      throw new ForbiddenError("Insufficient permissions");
    }
  }
}
```

**GroupMiddleware:**
```typescript
// Checks group membership and role
requireGroupAdmin(request, reply, done) {
  const membership = await groupMemberRepository.findByGroupAndUser(groupId, userId);
  if (!membership || !["GROUP_OWNER", "GROUP_ADMIN"].includes(membership.role)) {
    throw new ForbiddenError("Group admin access required");
  }
}
```

---

## Security Headers

All API responses include security headers via Helmet:

```http
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

## Rate Limiting

Auth-related rate limits:

| Endpoint | Limit | Window |
|---|---|---|
| POST /auth/register | 3 | 15 minutes |
| POST /auth/login | 5 | 1 minute |
| POST /auth/refresh | 10 | 1 minute |
| POST /auth/verify-otp | 5 | 5 minutes |
| POST /auth/resend-otp | 3 | 5 minutes |
| POST /auth/verify-login-otp | 5 | 5 minutes |

Global rate limit: 100 requests per minute per IP.

---

## Frontend Auth Implementation

### API Client Token Management

```typescript
// Access token stored in module-level variable
let currentAccessToken: string | null = null;

export function setAccessToken(token: string | null) {
  currentAccessToken = token;
}

export function getAccessToken(): string | null {
  return currentAccessToken;
}
```

### Session Restoration on Page Load

```typescript
export async function initAuth(): Promise<void> {
  try {
    // Refresh cookie sent automatically (HttpOnly)
    const refreshRes = await axios.post(`${BASE_URL}/auth/refresh`, {},
      { withCredentials: true }
    );
    const newToken = refreshRes.data.data.accessToken;
    setAccessToken(newToken);

    // Fetch user profile
    const profileRes = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${newToken}` },
    });

    useAppStore.setState({
      user: profileRes.data.data,
      role: profileRes.data.data.role,
      accessToken: newToken,
      isHydrated: true,
    });
  } catch {
    useAppStore.setState({ isHydrated: true });
  }
}
```

### ProtectedRoute Component

```typescript
function ProtectedRoute({ children, allowedRoles }) {
  const accessToken = useAppStore(s => s.accessToken);
  const isHydrated = useAppStore(s => s.isHydrated);
  const role = useAppStore(s => s.role);

  if (!isHydrated) return <Loading />;
  if (!accessToken) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={dashboardByRole(role)} />;
  }
  return children;
}
```
