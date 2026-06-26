# Security Architecture

This document describes the security architecture of Kolo — covering authentication, authorization, encryption, rate limiting, webhook verification, audit logging, and more.

---

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     Security Layers                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Layer 1: Transport Security                                │
│  ├── HTTPS (TLS 1.3)                                        │
│  ├── Helmet HTTP Headers (CSP, HSTS, X-Frame-Options)       │
│  └── CORS (explicit origin allowlist, no wildcard)          │
│                                                             │
│  Layer 2: Request Security                                  │
│  ├── Global rate limiting (100 req/min)                     │
│  ├── Per-route rate limiting (tighter limits on auth)       │
│  ├── Zod input validation (all endpoints)                   │
│  └── Request body size limits (1MB)                         │
│                                                             │
│  Layer 3: Authentication                                    │
│  ├── JWT access tokens (15 min expiry, in-memory only)      │
│  ├── Refresh tokens (HttpOnly Secure cookie, 7 day expiry)  │
│  ├── Argon2 password hashing                                │
│  └── Origin/Referer validation on refresh/logout            │
│                                                             │
│  Layer 4: Device Verification                               │
│  ├── Device fingerprinting (SHA-256 of UA + IP)             │
│  ├── Unknown device → OTP challenge via email               │
│  └── Known device marked via session tracking               │
│                                                             │
│  Layer 5: Authorization                                     │
│  ├── Role-based access (SUPER_ADMIN, GROUP_ADMIN, MEMBER)   │
│  ├── Group-level role checks (OWNER, ADMIN, MEMBER)         │
│  ├── Wallet ownership checks                                │
│  └── Resource-level authorization in service layer          │
│                                                             │
│  Layer 6: Financial Integrity                               │
│  ├── Atomic wallet operations                               │
│  ├── Webhook HMAC verification                              │
│  ├── Double-entry ledger                                    │
│  ├── Prisma transactions for multi-step ops                 │
│  └── Duplicate webhook detection                            │
│                                                             │
│  Layer 7: Audit & Monitoring                                │
│  ├── Audit logging for all sensitive operations             │
│  ├── Structured JSON logging                                │
│  ├── Security event monitoring                              │
│  └── Background job tracking                                │
│                                                             │
│  Layer 8: Secrets Management                                │
│  ├── All credentials from environment variables             │
│  ├── Never hardcode secrets in code                         │
│  ├── Separate JWT secrets (access vs refresh)               │
│  └── Cookie secret independent from JWT secret              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Authentication Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Auth Architecture                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Passwords: Argon2id (memory=19MiB, time=2, parallelism=1) │
│                                                             │
│  Access Tokens:                                             │
│  ├── Algorithm: HS256 (HMAC-SHA256)                         │
│  ├── Secret: JWT_SECRET (env var)                           │
│  ├── Expiry: 15 minutes                                     │
│  ├── Payload: { sub: userId, role: Role, type: "access" }   │
│  └── Storage: In-memory only (module variable + Zustand)    │
│                                                             │
│  Refresh Tokens:                                            │
│  ├── Algorithm: HS256                                       │
│  ├── Secret: JWT_REFRESH_SECRET (separate env var)          │
│  ├── Expiry: 7 days                                         │
│  ├── Payload: { sub: userId, type: "refresh" }              │
│  ├── Storage: SHA-256 hash in Session table                 │
│  └── Delivery: HttpOnly, Secure, SameSite=Strict cookie     │
│                                                             │
│  OTP Codes:                                                 │
│  ├── Storage: SHA-256 hash (raw code never persisted)       │
│  ├── Expiry: 10 minutes                                     │
│  ├── Attempt limit: 3 per code                              │
│  ├── Lockout: 15 minutes after 3 failures                   │
│  └── Resend cooldown: 60 seconds                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### JWT Token Verification

```typescript
class JwtUtil {
  static async verifyAccessToken(token: string): Promise<JwtPayload> {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(env.JWT_SECRET),
      { algorithms: ["HS256"] }
    );

    if (payload.type !== "access") {
      throw new AuthError("Invalid token type");
    }

    return payload;
  }
}
```

---

## Authorization Flow

```
Request → AuthMiddleware → RoleMiddleware → GroupMiddleware → Controller
    │           │               │               │
    │     1. Extract Bearer   2. Check         3. Check group
    │        token              User.role         membership
    │     2. Verify JWT        against           and role
    │     3. Load user         allowed roles     (if applicable)
    │     4. Check ACTIVE
    │     5. Set request.
    │        userId & role
```

### AuthMiddleware

```typescript
async authenticate(request, reply) {
  const token = extractBearerToken(request.headers.authorization);
  const payload = await JwtUtil.verifyAccessToken(token);
  const user = await this.userRepository.findById(payload.sub);

  if (!user) throw new AuthError("User not found");
  if (user.status !== "ACTIVE") throw new AuthError("Account is not active");

  request.userId = user.id;
  request.userRole = user.role;
}
```

### RoleMiddleware

```typescript
class RoleMiddleware {
  constructor(private allowedRoles: Role[]) {}

  async authorize(request, reply) {
    if (!this.allowedRoles.includes(request.userRole)) {
      throw new ForbiddenError("Insufficient permissions");
    }
  }
}
```

---

## Rate Limiting

| Endpoint Group | Limit | Window |
|---|---|---|
| Global | 100 requests | 1 minute |
| Auth: Register | 3 requests | 15 minutes |
| Auth: Login | 5 requests | 1 minute |
| Auth: Refresh | 10 requests | 1 minute |
| Auth: Verify OTP | 5 requests | 5 minutes |
| Auth: Resend OTP | 3 requests | 5 minutes |
| Admin: Reads | 60 requests | 1 minute |
| Admin: Mutations | 20 requests | 1 minute |

Rate limiting is enforced by `@fastify/rate-limit` plugin with configurable per-route limits.

---

## OTP Security

### OTP Flow

```
1. Generate 6-digit random code
2. Hash with SHA-256 → store codeHash
3. Send raw code via email
4. On verify:
   a. Hash submitted code
   b. Compare hashes
   c. Check expiry (10 min)
   d. Check attempt count (< 3)
   e. Check lockout (15 min after 3 failures)
   f. On success: mark OTP as used
   g. On failure: increment attemptCount
```

### Attempt Tracking

```typescript
async verify(userId: string, code: string, type: string): Promise<boolean> {
  const codeHash = crypto.createHash("sha256").update(code).digest("hex");
  const otp = await this.db.otpCode.findFirst({
    where: { userId, type, codeHash, used: false, expiresAt: { gte: new Date() } },
  });

  if (!otp) {
    // Track failed attempt
    await this.db.otpCode.updateMany({
      where: { userId, type, used: false },
      data: {
        attemptCount: { increment: 1 },
        lockedUntil: attemptCount >= 2 ? DateUtil.addMinutes(new Date(), 15) : undefined,
      },
    });
    return false;
  }

  return true; // Success
}
```

---

## Webhook Security

### HMAC Signature Verification

```typescript
class NombaWebhook {
  verifySignature(payload: string, signature: string, timestamp: string): boolean {
    const expected = crypto
      .createHmac("sha256", this.webhookSecret)
      .update(`${timestamp}.${payload}`)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature)
    );
  }
}
```

### Duplicate Detection
- By provider event ID (unique constraint)
- By signature within 5-minute replay window
- By payload content matching

---

## Cookie Security

```typescript
function setRefreshCookie(reply: FastifyReply, token: string): void {
  reply.setCookie("refreshToken", token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "strict",
    path: "/api/v1/auth",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    domain: env.COOKIE_DOMAIN,
  });
}
```

---

## CORS Configuration

```typescript
const allowedOrigins = env.isDevelopment
  ? ["http://localhost:5173", "http://localhost:5174"]
  : env.CORS_ORIGIN.split(",").filter(o => o.trim() !== "*");

app.register(fastifyCors, {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
```

---

## Security Headers

All backend responses include:

```http
Content-Security-Policy: default-src 'self'; script-src 'self'; ...
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

---

## Audit Logging

Every sensitive operation is logged:

| Event | Logged Data |
|---|---|
| Login success/failure | userId, IP, user-agent, reason |
| Registration | userId, email |
| Logout | userId |
| Payment created/verified | paymentId, amount, status |
| Payout created/approved/processed | payoutId, amount, actor |
| Wallet transfer | walletId, amount, source/dest |
| Group created/updated | groupId, actor |
| Member added/removed | groupId, memberId, actor |
| Admin action | actor, action, resource |

---

## Redacted Logging

Sensitive fields are automatically redacted from logs:

```typescript
const SENSITIVE_KEYS = new Set([
  "password", "passwordHash", "token", "accessToken", "refreshToken",
  "secret", "apiKey", "apiSecret", "authorization", "cookie",
  "verificationCode", "otp", "code", "pin", "bankAccount",
]);
```

---

## Dependency Security

- `npm audit --omit=dev` reports **0 vulnerabilities**
- Dependencies are pinned to specific versions
- Prisma client is regenerated on install
- No deprecated or unmaintained packages

---

## Security Checklist

- [x] Passwords hashed with Argon2
- [x] Access tokens expire after 15 minutes
- [x] Refresh tokens expire after 7 days
- [x] No tokens stored in localStorage
- [x] Refresh tokens in HttpOnly cookies
- [x] Refresh tokens SHA-256 hashed in database
- [x] Unknown device OTP challenge
- [x] OTP attempt lockout (3 strikes, 15 min)
- [x] OTP resend cooldown (60 seconds)
- [x] Rate limiting on all auth endpoints
- [x] Global rate limiting (100 req/min)
- [x] CORS with explicit origins
- [x] Helmet security headers
- [x] Origin/Referer validation on refresh
- [x] Input validation with Zod
- [x] Atomic wallet operations
- [x] Webhook HMAC verification
- [x] Double-entry accounting
- [x] Audit logging
- [x] Sensitive data redacted from logs
- [x] No secrets hardcoded in code
- [x] Separate secrets for access and refresh tokens
- [x] Cookie secret independent from JWT secret
- [x] 0 npm audit vulnerabilities
