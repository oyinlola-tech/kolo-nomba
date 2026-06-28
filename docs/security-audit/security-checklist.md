# Kolo Security Checklist

## Authentication
- [x] Passwords hashed with Argon2id (memory=19MiB, time=2)
- [x] Access tokens expire after 15 minutes
- [x] Refresh tokens expire after 7 days
- [x] No tokens stored in localStorage
- [x] Refresh tokens in httpOnly, Secure cookies
- [x] Refresh tokens SHA-256 hashed in database
- [x] Unknown device OTP challenge
- [x] OTP attempt lockout (3 strikes, 15 min)
- [x] OTP resend cooldown (60 seconds)
- [x] Rate limiting on auth endpoints
- [x] COOKIE_SECRET separate from JWT_SECRET (fixed)
- [x] Logout/session endpoint requires authentication (fixed)
- [ ] ⚠️ User enumeration — distinct errors for email vs phone
- [ ] ⚠️ No account lockout on failed login attempts
- [ ] ⚠️ No token revocation blocklist

## Authorization
- [x] Role-based access control (SUPER_ADMIN, GROUP_ADMIN, MEMBER)
- [x] Resource-level authorization in service layer
- [x] Group membership validation
- [x] Wallet ownership checks
- [x] Admin endpoint protection via RoleMiddleware
- [x] Frontend ProtectedRoute with role checks
- [ ] ⚠️ Group status not checked in group middleware
- [ ] ⚠️ No CSRF tokens on admin mutation endpoints

## API Security
- [x] All inputs validated with Zod
- [x] Global rate limiting (100 req/min)
- [x] Per-route rate limiting for sensitive endpoints
- [x] Helmet security headers with CSP
- [x] CORS with explicit origin allowlist
- [x] Body size limits (1MB)
- [x] Anti-CSRF header check (X-Requested-With)
- [x] Origin validation on refresh/logout
- [ ] ⚠️ Webhook endpoint needs dedicated rate limit config

## Database Security
- [x] All queries through Prisma ORM (no raw SQL)
- [x] No sensitive data in plaintext in DB
- [x] Error details hidden in production responses
- [x] Database credentials in environment variables
- [ ] ⚠️ Database indexes not verified for composite queries
- [ ] ⚠️ No connection pooling configuration

## Payment Security
- [x] Frontend cannot fake payment success (uses webhooks)
- [x] Webhook HMAC-SHA256 signature verification
- [x] Webhook timestamp validation (5 min window)
- [x] Duplicate webhook detection (eventId, signature, payload)
- [x] Duplicate payment prevention — providerReference check
- [x] Atomic wallet operations (increment/decrement)
- [x] Transaction integrity with Prisma $transaction
- [x] Double-entry ledger
- [x] Fee calculation and validation
- [ ] ⚠️ Payment verification processor is a stub — never calls Nomba
- [ ] ⚠️ Retry payment processor always fails (empty userId)
- [ ] ⚠️ Payout debits wallet BEFORE initiating transfer
- [ ] ⚠️ Double-payment race condition (TOCTOU)
- [ ] ⚠️ No idempotency key on payment creation
- [ ] ⚠️ Floating-point arithmetic for financial amounts
- [ ] ⚠️ Wallet double-spend window in async payouts

## Webhook Security
- [x] HMAC signature verification (FIXED: proper AppError class)
- [x] Timestamp validation (5 min window)
- [x] Duplicate detection (event ID, signature, payload)
- [x] Event persistence in WebhookEvent table
- [x] Background job processing with retries
- [ ] ⚠️ Webhook payload structure validation is too permissive (all fields optional + passthrough)

## Environment Security
- [x] All secrets from environment variables
- [x] No hardcoded secrets in code
- [x] Separate JWT secrets (access vs refresh)
- [x] Cookie secret separate from JWT secret (fixed)
- [x] Production validation of required env vars
- [x] .env.example documents all required variables
- [ ] ⚠️ Nomba private key sent in HTTP request body (external API requirement)

## Frontend Security
- [x] Access tokens in memory only (Zustand store)
- [x] Refresh tokens in httpOnly cookies
- [x] API client with automatic token refresh
- [x] Protected routes with role-based access
- [x] No sensitive credentials in frontend code
- [x] Proper error handling in API calls
- [x] Axios with withCredentials for cookie auth
- [ ] ⚠️ Email exposed as URL query parameter in OTP flow
- [ ] ⚠️ 40+ TypeScript type mismatches will cause runtime crashes
- [ ] ⚠️ Direct apiClient calls bypassing service layer (3 instances fixed, more remain)
- [ ] ⚠️ KYC service returns wrong data (calls /admin/users instead of /admin/kyc)
- [ ] ⚠️ Analytics service calls wrong endpoint
- [ ] ⚠️ No error boundary at app root

## Infrastructure
- [ ] ⚠️ HTTPS required — configure TLS certificate
- [ ] ⚠️ Database connection pooling not configured
- [ ] ⚠️ No monitoring/alerting configured (Sentry, APM, uptime)
- [ ] ⚠️ No Docker/deployment configuration
- [ ] ⚠️ No CI/CD pipeline
- [ ] ⚠️ No error tracking service

## Deployment
- [ ] ⚠️ Production environment variables set
- [ ] ⚠️ Database indexes verified
- [ ] ⚠️ Monitoring configured
- [ ] ⚠️ Backup strategy in place
- [ ] ⚠️ Incident response plan documented
- [ ] ⚠️ Load testing completed
- [ ] ⚠️ Rate limits tuned for production traffic
