# Kolo Bug Report

## Bug Tracking

| # | Issue | Location | Impact | Fix | Status |
|---|-------|----------|--------|-----|--------|
| 1 | Webhook signature failures return wrong HTTP code | `webhook.service.ts:39` | Nomba retries bad signatures | Use AppError subclasses | ✅ FIXED |
| 2 | Duplicate payment can credit wallet twice | `payment.service.ts:189-232` | Financial loss | Check providerReference | ✅ FIXED |
| 3 | Redis connection stub — never actually connects | `database/redis.ts:19-22` | Redis features silently broken | Real IORedis connection | ✅ FIXED |
| 4 | Empty contribution.service.ts | `services/contribution.service.ts` | Crashes if called | Dead code (unused) | ⚠️ UNUSED |
| 5 | Payment processor never verifies payments | `jobs/processors/payment.processor.ts:15-26` | Payments stuck PENDING | Needs business logic | ❌ OPEN |
| 6 | Retry payment processor always fails (empty userId) | `jobs/processors/payment.processor.ts:29-50` | Retries never work | Needs empty-string handling | ❌ OPEN |
| 7 | Unauthenticated logout/session endpoint | `routes/auth.route.ts:31-33` | Anyone can terminate sessions | Added auth middleware | ✅ FIXED |
| 8 | JWT secret used as cookie secret fallback | `config/env.config.ts:155` | Token forgery risk | Production now requires COOKIE_SECRET | ✅ FIXED |
| 9 | No graceful shutdown | `app.ts` | In-flight txns killed | SIGTERM/SIGINT handlers | ✅ FIXED |
| 10 | Payout debit before transfer initiated | `jobs/processors/payout.processor.ts:52-54` | Money loss if crash between debit/transfer | Needs reordering | ❌ OPEN |
| 11 | Double payment race condition (TOCTOU) | `payment.service.ts:42-64` | Two payments for same contribution | Needs DB locking | ❌ OPEN |
| 12 | Frontend: m-home accesses undefined `g.savingsBalance` | `features/member/pages/m-home.page.tsx:17` | Shows NaN | Added to type definition | ✅ FIXED |
| 13 | Frontend: m-groups uses `useUsers()` (admin endpoint) | `features/member/pages/m-groups.page.tsx:12` | Data leak — member sees all users | Added `memberName` warning | ❌ OPEN |
| 14 | Frontend: m-group-detail uses `Math.random() > 0.5` | `features/member/pages/m-group-detail.page.tsx:28` | Payout list changes randomly | Needs real filtering | ❌ OPEN |
| 15 | Frontend: m-pay uses setTimeout (fake payment) | `features/member/pages/m-pay.page.tsx:13` | Payment never recorded | Needs actual API call | ❌ OPEN |
| 16 | Frontend: contact form sends no data | `features/landing/pages/contact.page.tsx:50-60` | Users think they contacted support | Needs actual API call | ❌ OPEN |
| 17 | Frontend: register cooperative is fake | `features/auth/pages/register.page.tsx:34` | Users think they registered but didn't | Fixed to use authService | ✅ FIXED |
| 18 | Frontend: ga-create-group does nothing | `features/group/pages/ga-create-group.page.tsx:141` | No group actually created | Needs API integration | ❌ OPEN |
| 19 | Frontend: ga-payouts doesn't call API | `features/group/pages/ga-payouts.page.tsx:53` | No payout actually sent | Needs API integration | ❌ OPEN |
| 20 | Frontend: ga-settings save is fake | `features/group/pages/ga-settings.page.tsx:20` | Settings never saved | Needs API integration | ❌ OPEN |
| 21 | Frontend: register-cooperative.page.tsx dead code | `features/auth/pages/register-cooperative.page.tsx:1-41` | Never imported | Unused file | ❌ UNUSED |
| 22 | Frontend: constants/routes.ts dead code | `constants/routes.ts` | Never imported | Unused file | ❌ UNUSED |
| 23 | Frontend: KYC service calls wrong endpoint | `services/kyc.service.ts:6` | Returns all users as KYC submissions | Wrong endpoint | ❌ OPEN |
| 24 | Frontend: Analytics service calls wrong endpoint | `services/analytics.service.ts:10` | Returns group data as analytics | Wrong endpoint | ❌ OPEN |
| 25 | Frontend: verify-otp hardcoded redirect to member | `features/auth/pages/verify-otp.page.tsx:36` | Admins sent to member page | Role-based redirect | ✅ FIXED |
| 26 | Frontend: ga-dashboard uses `groupId="current"` | `features/group/pages/ga-dashboard.page.tsx:18` | Invalid API call | Placeholder string | ❌ OPEN |
| 27 | Frontend: sa-withdrawals Approve/Reject buttons no onClick | `features/admin/pages/sa-withdrawals.page.tsx:66-72` | Mutations defined but never wired | Button handlers missing | ❌ OPEN |
| 28 | Frontend: sa-verification Approve/Reject no onClick | `features/admin/pages/sa-verification.page.tsx:68-69` | Mutations defined but never wired | Button handlers missing | ❌ OPEN |
| 29 | Frontend: sa-disputes Resolve button no onClick | `features/admin/pages/sa-disputes.page.tsx:63` | Mutation defined but never wired | Button handler missing | ❌ OPEN |
| 30 | Frontend: m-profile settings buttons no onClick | `features/member/pages/m-profile.page.tsx:40-48` | 4 buttons do nothing | Handlers missing | ❌ OPEN |
| 31 | Frontend: Download Receipt buttons no onClick | `m-pay-success.page.tsx:28-29`, `m-history.page.tsx:46-48` | Buttons do nothing | Handlers missing | ❌ OPEN |
| 32 | Frontend: verify-otp uses direct apiClient | `features/auth/pages/verify-otp.page.tsx:32,49` | Architecture violation | Fixed to use authService | ✅ FIXED |
| 33 | Frontend: sa-settings uses direct apiClient | `features/admin/pages/sa-settings.page.tsx:26,46` | Architecture violation | Fixed to use notificationService | ✅ FIXED |
