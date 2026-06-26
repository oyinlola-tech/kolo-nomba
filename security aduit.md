# KOLO Security Aduit

Generated: 2026-06-26

## Executive Summary

I reviewed the React/Vite frontend and Fastify/Prisma backend for security loopholes, missing controls, and harmful failure modes. The most serious issues are broken object-level authorization around wallets, ledgers, transactions, and payouts; raw bearer tokens stored in browser `localStorage`; raw refresh tokens stored in the database; broad CORS defaults; and missing targeted brute-force controls on login/refresh/register. Dependency audit also found high-severity frontend React Router advisories.

This audit is source-based. Some deployment controls, such as CDN security headers, WAF rules, TLS, secrets manager policy, and production proxy limits, are not visible in this repository and should be verified separately.

## Critical Findings

### SEC-001: Broken object-level authorization on wallet reads, balance reads, and transfers

- Severity: Critical
- Location: `kolo-backend/src/controllers/wallet.controller.ts:14`, `kolo-backend/src/controllers/wallet.controller.ts:20`, `kolo-backend/src/controllers/wallet.controller.ts:38`, `kolo-backend/src/services/wallet.service.ts:44`, `kolo-backend/src/services/wallet.service.ts:55`, `kolo-backend/src/services/wallet.service.ts:129`
- Evidence:
  - Routes authenticate the caller, but `getById()` and `getBalance()` pass only the wallet ID to the service.
  - `WalletService.getWallet(id, userId?)` and `getBalance(id, userId?)` only check access when `userId` is provided.
  - `transfer()` accepts `sourceWalletId` and `destinationWalletId` from the request and never verifies the authenticated user can debit the source wallet.
- Impact: Any authenticated user who can guess or obtain a wallet ID can read another wallet, view balances, and potentially transfer funds out of wallets they do not own or administer.
- Fix:
  - Pass `request.userId` into all wallet service calls.
  - Make `userId` required for public wallet reads/transfers.
  - Enforce `assertWalletAccess()` before reading a wallet or debiting a source wallet.
  - Prefer server-derived source wallets instead of accepting `sourceWalletId` directly from the client.
- Mitigation: Add audit alerts for wallet access attempts where the authenticated user is not linked to the wallet owner.

### SEC-002: Broken object-level authorization on ledger entries

- Severity: Critical
- Location: `kolo-backend/src/controllers/ledger.controller.ts:12`, `kolo-backend/src/services/ledger.service.ts:11`
- Evidence:
  - The route authenticates users, but `LedgerController.getByWallet()` passes only `walletId`.
  - `LedgerService.getLedgerByWallet(walletId)` returns ledger entries without checking wallet ownership, group membership, or admin role.
- Impact: Any authenticated user can read another wallet's ledger entries if they know the `walletId`, exposing financial history and balances.
- Fix: Require `userId` in `getLedgerByWallet()`, load the wallet, and enforce the same wallet/group access policy used for wallet reads.

### SEC-003: Broken object-level authorization on transaction detail endpoint

- Severity: Critical
- Location: `kolo-backend/src/controllers/financial-transaction.controller.ts:17`, `kolo-backend/src/services/financial-transaction.service.ts:11`
- Evidence:
  - `getById()` passes only the transaction ID.
  - `getTransaction(id)` fetches by ID and maps the transaction without checking that the authenticated user owns either wallet or has group/admin access.
- Impact: Any authenticated user can read arbitrary financial transaction details by ID.
- Fix: Change `getTransaction(id, userId)` to verify the transaction's source or destination wallet is visible to that user before returning it.

### SEC-004: Payout reads and retry/receipt actions lack group membership or admin checks

- Severity: Critical
- Location: `kolo-backend/src/controllers/payout.controller.ts:35`, `kolo-backend/src/controllers/payout.controller.ts:41`, `kolo-backend/src/controllers/payout.controller.ts:80`, `kolo-backend/src/controllers/payout.controller.ts:86`, `kolo-backend/src/services/payout.service.ts:84`, `kolo-backend/src/services/payout.service.ts:89`, `kolo-backend/src/services/payout.service.ts:193`, `kolo-backend/src/services/payout.service.ts:312`
- Evidence:
  - `listByGroup()` calls `getPayouts(groupId)` without user context.
  - `getById()` calls `getPayout(id)` without user context.
  - `retryFailedTransfer(recipientId)` and `generateTransferReceipt(recipientId)` operate on recipient IDs without checking group access.
- Impact: Any authenticated user can list payouts for arbitrary groups, read payout details, view recipient transfer references, fetch receipts, or retry failed transfers by ID.
- Fix:
  - Pass `request.userId` into all payout read/action methods.
  - Enforce active group membership for reads.
  - Enforce group admin/owner for retry and processing operations.
  - Do not expose `destinationAccount` or provider references unless the caller is authorized.

### SEC-005: Payout processing does not validate admin access

- Severity: Critical
- Location: `kolo-backend/src/controllers/payout.controller.ts:74`, `kolo-backend/src/services/payout.service.ts:165`
- Evidence:
  - `processPayout(id, userId)` receives `userId` but does not call `validateAdminAccess()`.
  - It queues payout transfer jobs for every recipient once the payout is approved.
- Impact: Any authenticated user who knows an approved payout ID can trigger processing and potentially cause real fund movement.
- Fix: Add `await this.validateAdminAccess(payout.groupId, userId)` before balance checks and queueing.

## High Findings

### SEC-006: Access and refresh tokens are stored in browser localStorage

- Severity: High
- Location: `public/src/app/store.ts:42`, `public/src/app/store.ts:53`, `public/src/api/client.ts:27`, `public/src/api/client.ts:54`, `public/src/api/client.ts:68`
- Evidence:
  - Access token, refresh token, and user profile are read from and written to `window.localStorage`.
- Impact: Any XSS bug, malicious browser extension, or compromised third-party script can steal long-lived refresh tokens and impersonate users.
- Fix:
  - Prefer server-set `HttpOnly`, `Secure`, `SameSite` cookies for refresh/session tokens.
  - Keep access tokens short-lived and in memory when possible.
  - If bearer tokens remain in JS storage, add stronger XSS defenses, CSP, token rotation, and refresh-token reuse detection.

### SEC-007: Refresh tokens are stored in plaintext in the database

- Severity: High
- Location: `kolo-backend/src/services/auth.service.ts:130`, `kolo-backend/src/services/auth.service.ts:211`
- Evidence:
  - Refresh lookup uses `where: { refreshToken }`.
  - `createSession()` stores the full refresh token directly in `session.refreshToken`.
- Impact: A database leak exposes active refresh tokens that can be used until expiry.
- Fix:
  - Store only a keyed hash or strong digest of refresh tokens.
  - Compare hashes during refresh/logout.
  - Track token family/version and revoke on reuse.

### SEC-008: CORS defaults can reflect any Origin

- Severity: High
- Location: `kolo-backend/src/config/env.config.ts:80`, `kolo-backend/src/config/app.config.ts:54`, `kolo-backend/src/loaders/middleware.loader.ts:25`
- Evidence:
  - `CORS_ORIGIN` defaults to `"*"`.
  - If allowed origins include `"*"`, middleware uses `{ origin: true }`, which reflects request origins.
- Impact: If tokens are ever sent via cookies or if permissive CORS is combined with sensitive responses, malicious origins can read API responses from a victim browser. Even with bearer auth, this weakens origin isolation and increases blast radius.
- Fix:
  - Fail closed in production if no explicit CORS allowlist is configured.
  - Use exact trusted origins only.
  - Avoid `origin: true` in production.

### SEC-009: Login/register/refresh endpoints lack targeted brute-force and abuse protections

- Severity: High
- Location: `kolo-backend/src/routes/auth.route.ts:15`, `kolo-backend/src/routes/auth.route.ts:16`, `kolo-backend/src/routes/auth.route.ts:17`, `kolo-backend/src/loaders/middleware.loader.ts:31`
- Evidence:
  - Auth endpoints rely only on a global rate limit of `RATE_LIMIT_MAX`.
  - No username+IP failed-attempt throttling, account lock/step-up, device challenge, or refresh endpoint abuse control is visible.
- Impact: Attackers can attempt credential stuffing, password guessing, account enumeration pressure, refresh-token spraying, and mass fake registration until the broad global limiter triggers.
- Fix:
  - Add route-specific limits for `/auth/login`, `/auth/register`, and `/auth/refresh`.
  - Track failed login attempts by email/phone + IP.
  - Add progressive delays, alerts, and optional CAPTCHA/step-up after suspicious patterns.

### SEC-010: Nomba webhook signature validation may use reconstructed JSON instead of raw body

- Severity: High
- Location: `kolo-backend/src/controllers/webhook.controller.ts:26`, `kolo-backend/src/app.ts:17`
- Evidence:
  - Webhook controller uses `request.rawBody` if present, otherwise `JSON.stringify(request.body)`.
  - No `rawBody` plugin or custom content type parser is registered in the Fastify app.
- Impact: If Nomba signs the exact raw request body, valid webhooks may fail when whitespace, key order, or encoding differs after parsing. This can block payment reconciliation or create unreliable webhook processing.
- Fix:
  - Register a raw-body capture mechanism before JSON parsing for the webhook route.
  - Verify HMAC against the exact bytes/string received from Nomba.
  - Keep timestamp tolerance and timing-safe comparison.

### SEC-011: Frontend React Router dependency has high-severity advisories

- Severity: High
- Location: `public/package.json`, `public/package-lock.json`
- Evidence:
  - `npm audit --omit=dev --json` reported:
    - `@remix-run/router`: GHSA-2w69-qvjg-hvjx, high, XSS via open redirects.
    - `react-router`: GHSA-2j2x-hqr9-3h42, moderate open redirect range included in high effective dependency chain.
    - `react-router-dom`: affected through `react-router` and `@remix-run/router`.
- Impact: Routing and redirect behavior may be vulnerable to open redirect or XSS patterns depending on app usage.
- Fix: Upgrade `react-router` and `react-router-dom` to a patched version and rebuild/test route behavior.

## Medium Findings

### SEC-012: Group middleware checks the wrong route parameter for `:groupId` routes

- Severity: Medium
- Location: `kolo-backend/src/middleware/group.middleware.ts:8`, `kolo-backend/src/routes/contribution.route.ts:19`, `kolo-backend/src/routes/contribution.route.ts:27`, `kolo-backend/src/routes/contribution.route.ts:77`
- Evidence:
  - `GroupMiddleware` reads `(request.params as { id?: string }).id`.
  - Several routes use `:groupId`, not `:id`.
- Impact: Intended access checks can fail closed and deny legitimate contribution-plan and contribution requests. If future code assumes the middleware works on `groupId`, this pattern can also create accidental authorization bypasses.
- Fix: Make middleware read `id ?? groupId`, or provide separate middleware for group-scoped route params.

### SEC-013: Contribution plan global endpoints have no group access/admin middleware

- Severity: Medium
- Location: `kolo-backend/src/routes/contribution.route.ts:35`, `kolo-backend/src/routes/contribution.route.ts:41`, `kolo-backend/src/routes/contribution.route.ts:48`, `kolo-backend/src/routes/contribution.route.ts:56`, `kolo-backend/src/routes/contribution.route.ts:61`, `kolo-backend/src/routes/contribution.route.ts:66`, `kolo-backend/src/routes/contribution.route.ts:85`
- Evidence:
  - Global plan, cycle, dashboard, and contribution detail endpoints only use authentication.
  - No route-level group membership/admin check is visible for these object IDs.
- Impact: If the service layer does not resolve the object back to a group and enforce membership, authenticated users can read or modify another group's contribution plans/cycles/contribution details.
- Fix: Enforce object-level authorization in service methods, not only route middleware. Every plan/cycle/contribution ID should be resolved to its group before returning or mutating data.

### SEC-014: Security headers exist on the API but not visibly on the SPA shell

- Severity: Medium
- Location: `kolo-backend/src/loaders/middleware.loader.ts:30`, `public/index.html:1`
- Evidence:
  - Backend registers `@fastify/helmet`.
  - The SPA `public/index.html` has no CSP meta and no repository-visible static hosting config that sets CSP, frame ancestors, referrer policy, permissions policy, or nosniff for the frontend shell.
- Impact: The browser app lacks visible defense-in-depth against XSS, clickjacking, MIME sniffing, and excessive referrer leakage unless these are set at the deployment edge.
- Fix:
  - Set frontend security headers at the CDN/static host.
  - Add a realistic CSP, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, and `frame-ancestors`/`X-Frame-Options`.
  - Verify headers at runtime after deployment.

### SEC-015: Inline styles and JSON-LD require CSP planning

- Severity: Medium
- Location: `public/index.html:37`, `public/index.html:55`, `public/src/app/components/ui/chart.tsx:82`
- Evidence:
  - `index.html` contains inline JSON-LD and inline `<style>`.
  - Chart component uses `dangerouslySetInnerHTML` to inject generated CSS custom properties.
- Impact: These are not confirmed XSS bugs because the current data appears developer-controlled, but they will complicate a strict CSP and become dangerous if untrusted values ever reach chart IDs, chart keys, or colors.
- Fix:
  - Keep chart config developer-controlled or validate CSS colors/identifiers.
  - Use CSP nonces/hashes for required inline blocks, or move static inline CSS to files.
  - Avoid broad `unsafe-inline` in production CSP.

### SEC-016: Refresh endpoint body is not schema-validated

- Severity: Medium
- Location: `kolo-backend/src/controllers/auth.controller.ts:52`
- Evidence:
  - Refresh handler casts `request.body as { refreshToken: string }` and only checks truthiness.
- Impact: Unexpected body shapes can cause inconsistent behavior, noisy logs, and weaker request validation. This is lower risk than the token storage issue but should be fixed.
- Fix: Add a Zod schema for refresh/logout payloads with `refreshToken: z.string().min(...)`.

### SEC-017: Backend dependency audit reports moderate Prisma transitive vulnerability

- Severity: Medium
- Location: `kolo-backend/package.json`, `kolo-backend/package-lock.json`
- Evidence:
  - `npm audit --omit=dev --json` reported moderate advisories through `prisma -> @prisma/dev -> @hono/node-server`.
  - Advisory: GHSA-92pp-h63x-v22m, middleware bypass via repeated slashes in `serveStatic`.
- Impact: Current exploitability depends on whether the affected static serving path is reachable in this app. It is still a supply-chain risk and should be patched or pinned to a non-affected Prisma release.
- Fix: Upgrade/downgrade Prisma to a patched stable version recommended by the advisory, then run build/tests and regenerate Prisma client.

## Low Findings

### SEC-018: Swagger is disabled outside development, but depends on correct `NODE_ENV`

- Severity: Low
- Location: `kolo-backend/src/loaders/swagger.loader.ts:17`, `kolo-backend/src/config/env.config.ts:79`
- Evidence:
  - Swagger is skipped when `!isDevelopment`.
  - `NODE_ENV` defaults to `"development"`.
- Impact: If production deploys forget to set `NODE_ENV=production`, Swagger UI may be exposed and reveal API structure.
- Fix: Deployment should explicitly set `NODE_ENV=production`. Consider a separate `ENABLE_SWAGGER` flag defaulting false.

### SEC-019: Production runtime binds to `0.0.0.0` with no in-repo proxy hardening

- Severity: Low
- Location: `kolo-backend/src/app.ts:26`
- Evidence:
  - Server listens on all interfaces.
  - No repository-visible reverse proxy, timeout, connection limit, WAF, or edge rate-limit config.
- Impact: Public Node exposure without proxy controls can increase DoS risk and reduce observability.
- Fix: Run behind a hardened reverse proxy or managed platform with request/connection timeouts, body limits, TLS, logging, and edge throttling.

### SEC-020: No committed CI/security scanning workflow is visible

- Severity: Low
- Location: repository root
- Evidence:
  - No CI workflow files are visible in the scanned file list.
  - Dependency audit had to be run manually.
- Impact: Vulnerable dependency versions and security regressions can ship unnoticed.
- Fix: Add CI steps for `npm ci`, `npm audit --omit=dev` or a dedicated SCA tool, TypeScript build, lint, and targeted security tests for authorization.

## Positive Security Controls Found

- Password hashing uses `argon2` through `HashUtil` dependency path.
- JWT access tokens expire in 15 minutes and refresh tokens in 7 days.
- Webhook verification uses HMAC-SHA256 and `timingSafeEqual`.
- Webhook replay defenses exist through timestamp validation, duplicate event ID checks, signature replay checks, and payload duplicate checks.
- Backend uses Fastify `bodyLimit: 1048576`.
- Backend registers Helmet and a global rate limiter.
- Swagger is disabled when `NODE_ENV` is not development.
- Many controllers use Zod validators for request bodies.
- Admin routes are protected by authentication plus `SUPER_ADMIN` role middleware.

## Recommended Fix Order

1. Fix wallet, ledger, transaction, and payout object-level authorization before production use.
2. Add targeted auth rate limits and failed-login throttling.
3. Move refresh/session tokens out of `localStorage` or add a hardened transition plan.
4. Hash refresh tokens in the session table and add reuse detection.
5. Lock production CORS to exact allowed origins.
6. Capture raw request bodies for Nomba webhook verification.
7. Patch frontend React Router dependencies and backend Prisma advisory.
8. Add frontend security headers at the hosting edge.
9. Add authorization regression tests for every route that accepts an object ID.
