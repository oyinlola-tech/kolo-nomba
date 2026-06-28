# Kolo Bug Report

## Critical Bugs

### Bug 1: Webhook Signature Errors Return Wrong Status Code

**Issue:** Invalid webhook signatures returned HTTP 400 "Webhook processing failed" instead of HTTP 401 "Invalid webhook signature"
**Location:** `kolo-backend/src/controllers/webhook.controller.ts:33-48`
**Impact:** Security monitoring cannot distinguish between signature verification failures and other processing errors. Attacker probing cannot be detected.
**Fix:** Added signature error detection in catch block — 401 for signature failures, 400 for other errors.
**Status:** ✅ FIXED

### Bug 2: Duplicate Payments Can Be Processed

**Issue:** `processSuccessfulPayment` only checked if payment status was already SUCCESSFUL, not if a payment with the same provider reference existed
**Location:** `kolo-backend/src/services/payment.service.ts:189-232`
**Impact:** Replayed webhook could process the same payment twice, resulting in double-credit to wallets
**Fix:** Added duplicate detection by checking for existing successful payment with same provider reference
**Status:** ✅ FIXED

### Bug 3: Redis Connection Lacks URL Support

**Issue:** `QueueManager` only supports individual host/port/password config, not `rediss://` TLS URLs from Upstash
**Location:** `kolo-backend/src/jobs/queue-manager.ts:33-44`
**Impact:** Cannot connect to Upstash Redis (requires `rediss://` URL with TLS)
**Fix:** Added `REDIS_URL` env var support — if set, IORedis connects via URL instead of individual fields
**Status:** ✅ FIXED

---

## Medium Bugs

### Bug 4: Frontend Auth Uses Deprecated TanStack Query API

**Issue:** `profileQuery` in `use-auth.ts` uses deprecated `onSuccess` callback with `as never` cast
**Location:** `public/src/hooks/use-auth.ts:34-43`
**Impact:** Will break when upgrading to TanStack Query v5+
**Fix:** Migrate to `queryFn` only approach — handle profile hydration via `useEffect` or separate subscription
**Status:** ⏳ PENDING

### Bug 5: initAuth() Bypasses Service Layer

**Issue:** `initAuth()` makes direct `axios.post` and `axios.get` calls instead of using `apiClient`
**Location:** `public/src/app/store.ts:69,79`
**Impact:** Bypasses request/response interceptors, inconsistent error handling
**Fix:** Refactor to use the auth service layer
**Status:** ⏳ PENDING

### Bug 6: Duplicate Route Registration

**Issue:** `/register` and `/register/cooperative` both render `<RegisterPage />`
**Location:** `public/src/app/router.tsx:35-36`
**Impact:** No cooperative-specific registration page — the cooperative registration route just shows the same page
**Fix:** Either implement a separate cooperative registration page or add route-level logic to distinguish
**Status:** ⏳ PENDING

---

## Low Bugs

### Bug 7: Frontend Store Does Not Persist Auth Across Tabs

**Issue:** `initSession()` only sets `isHydrated: true` — does not actually load any session data
**Location:** `public/src/app/store.ts:41-43`
**Impact:** The store doesn't react to `initAuth()` results properly; auth state is only set once during initial load
**Fix:** Implement proper session hydration from the refresh endpoint
**Status:** ⏳ PENDING

### Bug 8: Error Response Shows Validation Errors to Users

**Issue:** Validation error details are returned in the API response, which could leak schema structure
**Location:** `kolo-backend/src/middleware/error.middleware.ts:23-30`
**Impact:** Minor information disclosure — attacker could infer validation rules
**Fix:** Consider returning generic validation error messages in production, with details only in development
**Status:** ⏳ PENDING

### Bug 9: No Frontend Loading State for Initial Auth Hydration

**Issue:** The `ProtectedRoute` component shows a spinner when `!isHydrated`, but if auth fails silently, the user gets stuck on loading
**Location:** `public/src/components/shared/ProtectedRoute.tsx:26-28`
**Impact:** Poor UX — user might stare at a spinner if `initAuth()` fails
**Fix:** Add timeout fallback to redirect to login after N seconds
**Status:** ⏳ PENDING
