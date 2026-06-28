# Kolo Security Audit Report

## Executive Summary

**Audit Date:** June 28, 2026
**Scope:** Full-stack Kolo fintech application (backend: Fastify/TypeScript/Prisma/PostgreSQL/Redis, frontend: React/TypeScript/Vite/Tailwind)
**Assessment:** Comprehensive security, quality, bug, and reliability audit

### Overall System Health: 🔶 CONDITIONAL (65/100)

Kolo has solid architectural foundations (Clean Architecture, Argon2 hashing, JWT auth, webhook HMAC verification). However, **8 critical vulnerabilities, 15 high-severity issues, and ~50+ frontend type mismatches** were identified. Core backend security is decent; the frontend has extensive "fake" flows and type errors that will crash at runtime.

**Backend: 72/100** — Good security patterns, but several payment processor stubs and race conditions.
**Frontend: 40/100** — Many hardcoded/fake flows, ~40 type mismatches, architectural violations.

---

## CRITICAL VULNERABILITIES

### C1. RedisClient is a Stub (No Real Connection)

**Severity:** CRITICAL
**Location:** `kolo-backend/src/database/redis.ts:19-22`
**Problem:** `RedisClient.connect()` only set a boolean flag — never created an IORedis connection. Any code using RedisClient (loaded via `database.loader.ts`) silently believed Redis was connected.
**Risk:** Nomba auth token caching, session management, and other Redis-dependent features silently fail.
**Fix Applied:** Rewrote RedisClient to use real IORedis connection with support for REDIS_URL (Upstash TLS) and individual host/port config.
**Future Improvement:** Consider sharing the IORedis connection between QueueManager and RedisClient to avoid duplicate connections.

### C2. Contribution Service is Empty

**Severity:** CRITICAL
**Location:** `kolo-backend/src/services/contribution.service.ts` (0 lines)
**Problem:** The entire contribution service file is empty. All contribution business logic (cycle generation, tracking, dashboards) is missing.
**Risk:** Any controller calling this service crashes or returns nothing. This file appears unused currently.
**Fix Applied:** None — the file is dead code (no imports reference it). Controller uses `member-contribution.service.ts` instead.

### C3. Payment Verification Processor Does Not Verify

**Severity:** CRITICAL
**Location:** `kolo-backend/src/jobs/processors/payment.processor.ts:15-26`
**Problem:** `VerifyPaymentProcessor.process()` calls `paymentService.getPayment(paymentId, "")` with empty userId, then just logs the status. It never calls `verifyAndCompletePayment` or contacts Nomba. Payment verification jobs are completely non-functional.
**Risk:** Payments stuck in PENDING forever — no automatic verification.
**Fix:** None applied (requires business logic implementation).

### C4. Retry Payment Processor Always Fails

**Severity:** CRITICAL
**Location:** `kolo-backend/src/jobs/processors/payment.processor.ts:29-50`
**Problem:** `getPayment(id, "")` passes empty string as userId. The service checks `payment.userId !== userId` and throws `AuthError("You do not have access to this payment")` — every retry fails immediately.
**Risk:** Payment retries never work.
**Fix:** None applied.

### C5. Contribution Processors Are All Stubs

**Severity:** CRITICAL
**Location:** `kolo-backend/src/jobs/processors/contribution.processor.ts:1-55`
**Problem:** `GenerateCyclesProcessor`, `CheckOverdueProcessor`, `SendReminderProcessor` all do nothing except log messages. No cycles generated, no overdue checks, no reminders sent.
**Risk:** Entire contribution lifecycle is non-functional.
**Fix:** None applied.

### C6. Payout Debit Before Transfer (Money Loss Risk)

**Severity:** CRITICAL
**Location:** `kolo-backend/src/jobs/processors/payout.processor.ts:52-54,61`
**Problem:** Debits the group wallet BEFORE calling transferService.initiateTransfer. If process crashes between debit and transfer, money is permanently lost.
**Risk:** Financial loss to the platform.
**Fix:** None applied (requires reordering operations with proper rollback).

### C7. Race Condition — Double Payment (TOCTOU)

**Severity:** CRITICAL
**Location:** `kolo-backend/src/services/payment.service.ts:42-64`
**Problem:** Check-then-act pattern: checks `contribution.status !== "PAID"` and `outstanding > 0`, then creates payment. Two concurrent requests can pass the check simultaneously and create two payments.
**Risk:** Double payment for same contribution.
**Fix:** None applied (needs database-level locking or unique constraint).

### C8. Floating-Point Money

**Severity:** CRITICAL
**Location:** All service files using number for amounts
**Problem:** JavaScript `number` is IEEE 754 floating point. All financial amounts use `number` — `0.1 + 0.2 = 0.30000000000000004`.
**Risk:** Accounting discrepancies, rounding errors over thousands of transactions.
**Fix:** None applied (would require bigint/Decimal migration across Prisma schema + codebase).

---

## HIGH-SEVERITY VULNERABILITIES

### H1. JWT Secret Used as Cookie Secret Fallback

**Severity:** HIGH
**Location:** `kolo-backend/src/config/env.config.ts:155 (fixed)`
**Problem:** If COOKIE_SECRET not set, JWT_SECRET was used as fallback. Cookie reader could obtain the JWT secret, enabling arbitrary token forgery.
**Risk:** Account takeover.
**Fix Applied:** In production, COOKIE_SECRET must be explicitly set or app errors. In dev, falls back to JWT_SECRET with a warning.
**Future:** Always require separate COOKIE_SECRET in all environments.

### H2. User Enumeration via Registration

**Severity:** HIGH
**Location:** `kolo-backend/src/services/auth.service.ts:37-45`
**Problem:** Distinct errors: "Email already registered" vs "Phone already registered". Attacker can enumerate emails/phones on platform.
**Risk:** Information disclosure.
**Fix:** None applied. Use generic "Registration failed" message.

### H3. Raw Error Thrown Instead of AppError

**Severity:** HIGH
**Location:** `kolo-backend/src/services/webhook.service.ts:39,47,110`
**Problem:** Raw `throw new Error(...)` bypasses the error middleware's `instanceof AppError` check, causing wrong HTTP status codes (500 instead of 401/422).
**Risk:** Incorrect error responses to Nomba webhooks.
**Fix Applied:** Created `WebhookSignatureError`, `WebhookPayloadError`, `WebhookNotFoundError` extending AppError. Webhook controller now uses `instanceof AppError` instead of string matching.

### H4. Error String Matching for Status Codes

**Severity:** HIGH
**Location:** `kolo-backend/src/controllers/webhook.controller.ts:37-40 (fixed)`
**Problem:** Error classification used `errorMessage.includes("signature")` — any error with "signature" in message got 401. Fragile and incorrect.
**Risk:** Misclassified errors, wrong HTTP status codes.
**Fix Applied:** Replaced with `instanceof AppError` check using proper error class hierarchy.

### H5. Unauthenticated Logout/Session Endpoint

**Severity:** HIGH
**Location:** `kolo-backend/src/routes/auth.route.ts:31-33 (fixed)`
**Problem:** `POST /auth/logout/session` had NO auth middleware. Anyone could terminate any user's session by providing a refresh token.
**Risk:** Session hijacking/termination.
**Fix Applied:** Added `preHandler: this.authMiddleware.authenticate`.

### H6. Payment Verification Error Swallowed

**Severity:** HIGH
**Location:** `kolo-backend/src/services/payment.service.ts:283-289`
**Problem:** `verifyAndCompletePayment` catches ALL errors in a generic `catch` block and only logs. Nomba API errors leave payment in PENDING permanently.
**Risk:** Payments stuck forever with no alert.
**Fix:** None applied.

### H7. No Timeout on Nomba HTTP Requests

**Severity:** HIGH
**Location:** `kolo-backend/src/integrations/nomba/nomba.client.ts:58-68`
**Problem:** `fetch()` has zero timeout. A hanging Nomba API call holds the connection indefinitely.
**Risk:** Connection pool exhaustion.
**Fix:** None applied.

### H8. Private Key in Request Body (Log Exposure)

**Severity:** HIGH
**Location:** `kolo-backend/src/integrations/nomba/nomba.auth.ts:49-50`
**Problem:** Nomba private key sent in POST body (both `private_key` and `privateKey` fields). Exposed in request logs.
**Risk:** Credential leak.
**Fix:** None applied (Nomba API requires it in body). Use log redaction middleware.

### H9. Reconciliation Query With No Limit

**Severity:** HIGH
**Location:** `kolo-backend/src/jobs/processors/reconciliation.processor.ts:144`
**Problem:** `reconciliationRepo.findAll()` with no pagination loads ALL records.
**Risk:** OOM crash with hundreds of thousands of records.
**Fix:** None applied.

### H10. Wallet Double-Spend Window in Payout

**Severity:** HIGH
**Location:** `kolo-backend/src/services/payout.service.ts:41-52`
**Problem:** Wallet balance checked at payout creation, but processing is async. Multiple payouts can be created exceeding balance.
**Risk:** Overdraft — wallet goes negative.
**Fix:** None applied (needs wallet hold/reserve mechanism).

### H11. Transfer Status Returns FAILED on Network Error

**Severity:** HIGH
**Location:** `kolo-backend/src/integrations/nomba/nomba.transfer.ts:109-122`
**Problem:** Network errors cause `status: "FAILED"` — a successful-but-unconfirmed transfer treated as failed, possibly triggering incorrect reversal.
**Risk:** Incorrect reversal of successful transfers.
**Fix:** None applied (distinguish network errors from API failures).

### H12. Missing Database Indexes

**Severity:** HIGH
**Location:** Various repositories
**Problem:** Queries filter by (provider, eventId), (provider, signature, createdAt), (groupId, status), etc. — composite indexes likely missing from Prisma schema.
**Risk:** Slow queries at scale.
**Fix:** None applied (requires Prisma schema migration).

### H13. Unawaited Audit Log Calls

**Severity:** HIGH
**Location:** Multiple service files (e.g., `payment.service.ts:100,232`)
**Problem:** `auditService.log(...)` not awaited. If audit DB write fails, exception is unhandled and audit trail is lost.
**Risk:** Lost audit trail, silent failures.
**Fix:** None applied.

### H14. Report/Analytics Processors Are Stubs

**Severity:** HIGH
**Location:** `kolo-backend/src/jobs/processors/report.processor.ts:1-55`, `analytics.processor.ts:1-28`
**Problem:** All 7 processors do nothing except log. Reporting and analytics are completely non-functional.
**Risk:** No reports, no analytics dashboards.
**Fix:** None applied.

### H15. Webhook Error Propagation — Wrong Status Code

**Severity:** HIGH
**Location:** `kolo-backend/src/services/webhook.service.ts:39`
**Problem:** `throw new Error("Invalid webhook signature")` treated as 500 by error middleware instead of 401.
**Risk:** Nomba receives 500 for bad signatures, may retry incorrectly.
**Fix Applied:** Now throws `WebhookSignatureError` (extends AppError, status 401).

---

## MEDIUM-SEVERITY ISSUES

| # | Issue | Location | Risk |
|---|-------|----------|------|
| M1 | Singleton anti-pattern (tight coupling) | `env.config.ts`, `prisma.ts`, `redis.ts` | Testing difficulty |
| M2 | No graceful shutdown (FIXED) | `app.ts` | In-flight txns lost on SIGTERM |
| M3 | Job loader failure silently downgraded | `loaders/index.ts:35-40` | Queues silently stop working |
| M4 | DB hit on every authenticated request | `auth.middleware.ts:33-37` | Unnecessary DB load |
| M5 | No token revocation mechanism | `auth.middleware.ts:28-30` | Stolen tokens valid for 15 min |
| M6 | Group status not checked in middleware | `group.middleware.ts:20-26` | Operations on suspended groups |
| M7 | No account lockout on failed login | `auth.service.ts:152-172` | Brute-force attacks |
| M8 | OTP resend server-side rate limit weak | `auth.service.ts:127-150` | SMS/email spam |
| M9 | No refresh token reuse detection | `auth.service.ts:250-290` | Token theft undetected |
| M10 | No session deletion on password change | Missing functionality | Stolen sessions persist |
| M11 | Payout creator can self-approve | `payout.service.ts:120-142` | No separation of duties |
| M12 | No idempotency key on payment | `payment.service.ts:42` | Duplicate payments on retry |
| M13 | Payment reference not globally unique | `payment.service.ts:76` | Reference collision risk |
| M14 | Webhook queue submit not retried on Redis failure | `webhook.service.ts:99-103` | Webhook events lost |
| M15 | Weak duplicate webhook detection | `webhook.repository.ts:74-90` | Missed duplicates on payload change |
| M16 | Wallet creation race condition | `wallet.service.ts:34-44` | Duplicate wallets |
| M17 | Platform wallet inside transaction | `wallet.service.ts:259-263` | Txn rollback but Nomba paid |
| M18 | Missing CSRF on admin mutations | `admin.route.ts:24-27` | CSRF attacks |
| M19 | Webhook validator accepts any payload | `webhook.validator.ts:21-29` | All fields optional + passthrough |
| M20 | Orphan retry queues | `jobs/index.ts:62-75` | Jobs never processed |
| M21 | Coin precision mismatch | `payment.validator.ts:14` | Validation failures |
| M22 | 40+ frontend TypeScript type mismatches | Multiple .tsx files | Runtime crashes |
| M23 | Contact form sends no data | `contact.page.tsx:50-60` | User trust violated |
| M24 | Email exposed in URL query params | `register.page.tsx:32`, `verify-otp.page.tsx:14` | Privacy leak |

---

## LOW-SEVERITY ISSUES

| # | Issue | Location |
|---|-------|----------|
| L1 | No Prisma connection pooling config | `prisma.ts:14` |
| L2 | Rate limit key uses IP only | `middleware.loader.ts:61-63` |
| L3 | `rate-limit.middleware.ts` is pointless stub | `middleware/rate-limit.middleware.ts:1-9` |
| L4 | All status updates use `as never` | Multiple repository files |
| L5 | Device hash collision (no userId) | `otp.service.ts:113-116` |
| L6 | No observability (Sentry, APM) | Whole project |
| L7 | No 404 page in frontend router | `router.tsx:94` |
| L8 | Routes constants file entirely unused | `constants/routes.ts` |
| L9 | `register-cooperative.page.tsx` dead code | Entire file unused |
| L10 | Multiple "Download Receipt" buttons do nothing | `m-history`, `m-pay-success` |
| L11 | Profile settings buttons have no onClick | `m-profile.page.tsx:40-48` |

---

## Vulnerabilities Fixed During This Audit

| Issue | File | Fix |
|-------|------|-----|
| C1 RedisClient stub | `kolo-backend/src/database/redis.ts` | Real IORedis connection with Upstash support |
| C3/H3 Raw Error in webhook | `kolo-backend/src/services/webhook.service.ts` | AppError subclasses (WebhookSignatureError, etc.) |
| H4 String matching | `kolo-backend/src/controllers/webhook.controller.ts` | `instanceof AppError` with proper HTTP codes |
| H5 Unauthenticated logout/session | `kolo-backend/src/routes/auth.route.ts` | Added auth middleware |
| H1 COOKIE_SECRET fallback | `kolo-backend/src/config/env.config.ts` | Production requires explicit COOKIE_SECRET |
| H16 Graceful shutdown | `kolo-backend/src/app.ts` | SIGTERM/SIGINT handlers with cleanup |
| Frontend type definitions | `public/src/types/platform.types.ts` | Added all missing properties (adminName, savingsBalance, etc.) |
| Frontend architecture violations | `register.page.tsx`, `verify-otp.page.tsx`, `sa-settings.page.tsx` | Using service layer instead of direct apiClient |
| Auth service types | `public/src/services/auth.service.ts` | Proper RegisterResponse type, verifyOtp/resendOtp functions |
| Webhook error handling | `kolo-backend/src/errors/webhook.error.ts` | Created proper error classes (NEW FILE) |
