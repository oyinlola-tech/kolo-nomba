# Security Audit

Date: 2026-06-27

Scope reviewed: React/Vite frontend in `public` and Fastify/Prisma backend in `kolo-backend`.

## Executive Summary

This pass re-scanned both frontend and backend, including auth/session handling, role checks, group/payout/contribution authorization, payment/webhook processing, frontend storage, CSP, dependency audit results, and build status.

The current tree has improved since the previous audit. Registration no longer publishes raw OTPs through the event bus, login now has an email OTP challenge for unknown devices, OTP attempt lockout and resend cooldowns exist, the OTP email expiry text matches the backend, the registration page runtime bug is fixed, and both frontend and backend builds now pass.

New confirmed issues remain. The highest-risk finding is that reconciliation endpoints are outside the super-admin route group and allow any active authenticated user to list and resolve reconciliation records. A previous contribution-plan issue is partially fixed: updates now require group admin access, but deletes/completion still only require ordinary group membership. I also found payout recipient-account ID validation gaps, the existing SPA meta CSP limitation, stale localStorage profile/role state, and a backend transaction-list query bug.

Application code was not changed during this audit pass. I updated this report file only.

## Critical Findings

No confirmed critical findings.

## High Findings

### H-01: Any authenticated active user can list and resolve reconciliation records

Location:
- `kolo-backend/src/routes/reconciliation.route.ts:14`
- `kolo-backend/src/routes/reconciliation.route.ts:16`
- `kolo-backend/src/routes/reconciliation.route.ts:19`
- `kolo-backend/src/routes/reconciliation.route.ts:21`
- `kolo-backend/src/controllers/reconciliation.controller.ts:14`
- `kolo-backend/src/controllers/reconciliation.controller.ts:38`
- `kolo-backend/src/services/reconciliation.service.ts:18`
- `kolo-backend/src/services/reconciliation.service.ts:31`

Evidence:
```ts
app.get(`${prefix}/reconciliation`, {
  preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
  handler: this.controller.list.bind(this.controller),
});
```

```ts
app.post(`${prefix}/reconciliation/:id/resolve`, {
  preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
  handler: this.controller.resolve.bind(this.controller),
});
```

Impact: Any active logged-in member can view provider reconciliation records and mark them resolved. This exposes financial operations data and lets non-admin users alter reconciliation state.

Fix: Move these routes under the admin route group or add `RoleMiddleware(Roles.SUPER_ADMIN)` to both reconciliation routes. Also ignore client-provided `resolvedBy` and use `request.userId`.

Mitigation: Audit recent reconciliation changes and compare `resolvedBy` values against real super-admin users.

False positive notes: Admin Nomba reconciliation endpoints are super-admin protected, but these non-admin `/reconciliation` endpoints are still registered separately.

### H-02: Any active group member can complete/delete contribution plans

Location:
- `kolo-backend/src/routes/contribution.route.ts:48`
- `kolo-backend/src/routes/contribution.route.ts:49`
- `kolo-backend/src/services/contribution-plan.service.ts:110`
- `kolo-backend/src/services/contribution-plan.service.ts:113`
- `kolo-backend/src/services/contribution-plan.service.ts:116`

Evidence:
```ts
app.delete(`${prefix}/contribution-plans/:id`, {
  preHandler: [
    this.authMiddleware.authenticate.bind(this.authMiddleware),
  ],
  handler: this.controller.deletePlan.bind(this.controller),
});
```

```ts
if (userId) {
  await this.validateGroupAccess(groupId, userId);
}
await this.planRepository.updateStatus(id, "COMPLETED");
```

Impact: An ordinary active group member who knows a contribution plan ID can mark the plan completed. This can disrupt contribution schedules and financial workflows.

Fix: Change `deletePlan()` to call `validateGroupAdminAccess(groupId, userId)` just like `updatePlan()` now does.

Mitigation: Review recent `CONTRIBUTION_PLAN_COMPLETED` audit entries for non-admin actors.

False positive notes: The previous update-plan issue is fixed at `contribution-plan.service.ts:96`; this finding is now specifically for delete/complete.

## Medium Findings

### M-01: Payout creation accepts recipient account IDs without ownership or verification checks

Location:
- `kolo-backend/src/validators/payout.validator.ts:11`
- `kolo-backend/src/services/payout.service.ts:41`
- `kolo-backend/src/services/payout.service.ts:66`
- `kolo-backend/src/services/payout.service.ts:71`
- `kolo-backend/src/jobs/processors/payout.processor.ts:47`

Evidence:
```ts
recipientAccountId: z.string().uuid().optional(),
```

```ts
await this.recipientRepository.create({
  payoutId: payout.id,
  userId: recipient.userId,
  amount: recipient.amount,
  destinationAccount: recipient.destinationAccount,
  recipientAccountId: recipient.recipientAccountId,
});
```

Impact: A group admin can attach any known `PayoutRecipientAccount` UUID to a payout recipient. If IDs leak through logs, UI, or another endpoint, payouts can be routed to an account that does not belong to the selected recipient. The code also does not require the account to be verified.

Fix: Before creating each payout recipient, load `recipientAccountId` and require `account.userId === recipient.userId` and `account.verified === true`. Prefer requiring `recipientAccountId` over free-form `destinationAccount`.

Mitigation: Log selected recipient account IDs during payout creation and flag mismatches between recipient user and account owner.

False positive notes: This requires group-admin privilege or a compromised group-admin account, but payout routing is high-value enough to require strict ownership checks.

### M-02: SPA CSP is still a weak meta policy with `unsafe-inline`

Location:
- `public/index.html:8`
- `kolo-backend/src/loaders/middleware.loader.ts:39`
- `kolo-backend/src/loaders/middleware.loader.ts:40`

Evidence:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; ... frame-ancestors 'none'; ...">
```

Impact: If the frontend is served statically, this meta CSP may be the only visible policy. `unsafe-inline` weakens XSS defense-in-depth, and `frame-ancestors` is ignored in meta-delivered CSP.

Fix: Set CSP, `frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy` as HTTP headers at the CDN/static host. Remove `unsafe-inline` once inline JSON-LD/style needs are handled through hashes, nonces, or external files.

Mitigation: Verify deployed frontend response headers at runtime.

False positive notes: Backend Helmet production CSP is stricter, but it only helps responses served by the backend. Static SPA hosting still needs real headers.

## Low Findings

### L-01: Frontend persists user profile and role in localStorage

Location:
- `public/src/app/store.ts:36`
- `public/src/app/store.ts:57`
- `public/src/app/store.ts:102`
- `public/src/components/shared/ProtectedRoute.tsx:34`

Evidence:
```ts
const raw = window.localStorage.getItem("kolo.user");
window.localStorage.setItem("kolo.user", JSON.stringify(user));
```

Impact: Tokens are not stored in localStorage, which is good. However, localStorage profile/role data can be stale or tampered with and is used for route gating. This is mostly a UX/defense-in-depth issue because backend routes enforce real authorization.

Fix: Treat stored user data as a cache only. Keep protected routes blocked until `initAuth()` refreshes and `/auth/me` returns. Consider storing less profile data, or only a boolean hint that a previous session existed.

Mitigation: Ensure every sensitive backend route continues to enforce server-side authorization.

False positive notes: I did not find access or refresh tokens persisted in localStorage/sessionStorage.

### L-02: User transaction list query passes unresolved promises into Prisma filters

Location:
- `kolo-backend/src/repositories/financial-transaction.repository.ts:22`
- `kolo-backend/src/repositories/financial-transaction.repository.ts:26`
- `kolo-backend/src/repositories/financial-transaction.repository.ts:27`
- `kolo-backend/src/controllers/financial-transaction.controller.ts:11`

Evidence:
```ts
{ sourceWalletId: { in: this.db.wallet.findMany(...).then(w => w.map(w => w.id)) } as never },
```

Impact: `/transactions` can fail or behave unpredictably because Prisma expects an array for `in`, not a Promise. This is not a direct authorization bypass because single-transaction access checks wallets separately, but it weakens reliability of a financial history endpoint.

Fix: Resolve wallet IDs first, then pass the array into `findMany`.

Mitigation: Add a focused test for `/transactions` returning only the current user's wallet transactions.

False positive notes: This is a correctness/security-adjacent issue, not a confirmed data leak.

## Resolved Since Previous Audit

- Raw OTP is no longer published in `UserEvent("verification_required")`; registration only publishes `userId`.
- Unknown-device login challenge now exists and sends an email OTP before issuing tokens.
- OTP verification now tracks `attemptCount`, `lockedUntil`, and resend cooldown.
- OTP email copy now says 10 minutes, matching `OTP_EXPIRY_MINUTES = 10`.
- Registration page now uses `loading` instead of removed `register.isPending`.
- Backend `npm run build` now passes.
- Contribution plan update now requires `validateGroupAdminAccess()`.
- Email templates now escape most variables and validate button URLs.

## Positive Findings

- Refresh tokens are delivered through an `HttpOnly` cookie and are not returned in controller JSON responses.
- Access tokens are kept in memory in the frontend API client.
- Refresh token sessions store SHA-256 token hashes.
- Refresh/logout endpoints enforce exact Origin/Referer checks outside development.
- Auth middleware checks that the bearer-token user still exists and is `ACTIVE`.
- Login, register, OTP, payment, payout, wallet, and admin inputs mostly use Zod validation.
- Backend Helmet, CORS allowlists, and global/per-route rate limits are configured.
- Wallet reads/transfers enforce wallet or group access, and group-wallet transfers require admin/owner.
- No high-risk frontend DOM XSS sink was confirmed; the chart style sink sanitizes chart IDs, keys, and CSS colors before `dangerouslySetInnerHTML`.
- `npm audit --omit=dev` reports zero vulnerabilities in both frontend and backend.

## Verification

- `npm audit --omit=dev` in `public`: passed, 0 vulnerabilities.
- `npm audit --omit=dev` in `kolo-backend`: passed, 0 vulnerabilities.
- `npm run build` in `public`: passed, with a large chunk warning.
- `npm run build` in `kolo-backend`: passed.

## Changes Made

Updated this report file: `security aduit.md`.

No application code was changed during this audit pass.

## Recommended Fix Order

1. Restrict reconciliation list/resolve routes to `SUPER_ADMIN` and use `request.userId` as resolver.
2. Restrict contribution plan delete/complete to group owners/admins.
3. Validate payout recipient account ownership and verified status before payout creation.
4. Move frontend security headers to the static host/CDN and remove `unsafe-inline` where feasible.
5. Stop trusting localStorage profile/role until server rehydration completes.
6. Fix the user transaction list Prisma query and add an endpoint test.
