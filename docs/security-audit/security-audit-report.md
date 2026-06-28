# Kolo Security Audit Report

## Executive Summary

**Audit Date:** June 28, 2026
**Scope:** Full-stack Kolo fintech application (backend + frontend)
**Assessment:** Comprehensive security, quality, and reliability audit

### Overall System Health: 🔶 MODERATE

Kolo is a fintech platform for digitizing African cooperative savings (Ajo, Esusu). The codebase follows Clean Architecture with good separation of concerns. Several **critical security issues have been identified and resolved**, while some medium-risk items remain.

---

## Critical Vulnerabilities Found & Fixed

### 1. Webhook Signature Verification Failure Masking

**Severity:** CRITICAL
**Location:** `kolo-backend/src/controllers/webhook.controller.ts:33-48`
**Problem:** The webhook catch block treated ALL errors (including invalid HMAC signatures) as generic "Webhook processing failed" with HTTP 400. An attacker submitting an invalid signature could not be distinguished from legitimate processing errors.
**Risk:** Attacker could probe the endpoint, and security monitoring would not detect signature verification failures. This is a **financial system** — invalid signatures on payment webhooks must be loudly rejected.
**Fix Applied:** Added signature error detection: signature verification failures now return HTTP 401 with "Invalid webhook signature" message, while other processing errors return HTTP 400.
**Recommended Future Improvement:** Add signature verification failure rate monitoring + alerting, and implement IP-based blocking after N failed attempts.

### 2. Duplicate Payment Processing (Idempotency Gap)

**Severity:** HIGH
**Location:** `kolo-backend/src/services/payment.service.ts:189-232`
**Problem:** The `processSuccessfulPayment` method only checked if the payment status was already `SUCCESSFUL` but did not verify whether a payment with the same provider reference already existed. A replayed or duplicate webhook could process the same transaction twice.
**Risk:** **Double-credit to wallets** — financial data corruption and potential loss of platform funds.
**Fix Applied:** Added duplicate detection by checking if a payment with the same `providerReference` already has status `SUCCESSFUL` before processing.
**Recommended Future Improvement:** Implement database-level unique constraint on `providerReference` for payments, and add webhook event idempotency keys.

### 3. Weak Error Categorization in Security Events

**Severity:** MEDIUM
**Location:** Multiple controllers and error middleware
**Problem:** Error logging lacked consistent categorization for security-relevant events (signature failures, auth failures, permission denials). All errors were logged at the same level, making security incident investigation difficult.
**Fix Applied:** Improved webhook controller with specific error categories and appropriate HTTP status codes.
**Recommended Future Improvement:** Implement structured security event logging with standardized fields (eventType, severity, actor, resource, outcome).

### 4. Frontend Auth Profile Query Uses Deprecated TanStack Query API

**Severity:** LOW
**Location:** `public/src/hooks/use-auth.ts:34-43`
**Problem:** The `profileQuery` uses the deprecated `onSuccess` callback and casts with `as never`. This works in current TanStack Query v4 but will break in v5+.
**Fix Needed:** Migrate to the new TanStack Query v5 API — use `queryFn` only, and handle side effects via `useEffect` or the `onSuccess` in the query options at the hook caller level.
**Risk:** Application crash when upgrading TanStack Query.

### 5. Direct Axios Calls Bypassing Service Layer

**Severity:** LOW
**Location:** `public/src/app/store.ts:69,79`
**Problem:** The `initAuth()` function makes direct `axios.post` and `axios.get` calls instead of using the `apiClient` service. This bypasses the request/response interceptors (token refresh, error handling).
**Fix Needed:** Refactor `initAuth()` to use the service layer.
**Risk:** Inconsistent error handling during initial auth hydration.

### 6. Missing Rate Limit on Webhook Endpoint

**Severity:** MEDIUM
**Location:** `kolo-backend/src/middleware/rate-limit.middleware.ts` (not found — webhook endpoint uses default global rate limit only)
**Problem:** Webhook endpoints should have higher rate limits than user-facing endpoints to avoid legitimate payment webhooks being rejected, but they should still be rate-limited.
**Fix Needed:** Add a specific rate limit configuration for webhook endpoints.
**Risk:** Legitimate payment webhooks could be rate-limited, causing payment processing delays.

### 7. No Input Validation on Webhook Payload Structure

**Severity:** LOW
**Location:** `kolo-backend/src/services/webhook.service.ts:146-156`
**Problem:** The `handlePaymentSuccess` method extracts fields from the webhook payload without validating the payload structure with a Zod schema first.
**Fix Needed:** Add Zod validation for webhook payload structure.
**Risk:** Malformed webhook payloads could cause unexpected errors.

---

## Vulnerabilities Found & Assessed (No Fix Applied — Acceptable Risk)

### 8. In-Memory Token Storage (Frontend)

**Severity:** LOW (Acceptable)
**Location:** `public/src/app/store.ts`
**Assessment:** Access tokens are stored in Zustand (in-memory) only. Refresh tokens are in httpOnly secure cookies. This is the correct pattern — no tokens in localStorage.
**Risk:** A memory-sniffing attack on the client could expose the access token, but it expires in 15 minutes. This is standard industry practice.

### 9. OTP Challenge for Unknown Devices

**Severity:** INFORMATIONAL
**Location:** `kolo-backend/src/services/auth.service.ts:184-206`
**Assessment:** New device login requires OTP verification via email. Known devices skip the challenge. This is good security practice.
**Risk:** None. This is a security strength.

### 10. Password Hashing with Argon2

**Severity:** INFORMATIONAL
**Location:** `kolo-backend/src/utils/hash.util.ts`
**Assessment:** Passwords are hashed with Argon2id (memory=19MiB, time=2). This is the recommended algorithm for password hashing.
**Risk:** None. This is a security strength.

### 11. CSP and Security Headers

**Severity:** LOW
**Location:** `kolo-backend/src/loaders/middleware.loader.ts:42-57`
**Assessment:** Content Security Policy is configured with `default-src 'self'`, restricted script sources, and `frameAncestors: 'none'`. In development, `'unsafe-inline'` is allowed for scripts and styles, which is standard for dev mode.
**Risk:** Development CSP allows `'unsafe-inline'` for scripts — not a production risk since it's dev-only.
