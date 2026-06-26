# Nomba Integration

This document explains how Kolo integrates with the Nomba payment gateway — covering authentication, payment flow, virtual accounts, transfers, and webhooks.

---

## Why Nomba?

Nomba is a leading Nigerian payment infrastructure provider that offers:

- **Payment initiation** (card, bank, USSD)
- **Payment verification** (confirm transaction status)
- **Virtual accounts** (dedicated bank account numbers)
- **Transfers** (send money to bank accounts)
- **Webhooks** (real-time payment notifications)

Kolo chose Nomba for its comprehensive API, Nigerian market focus, and reliable webhook system.

---

## Integration Architecture

```
┌──────────┐    ┌──────────────┐    ┌───────────┐
│  Kolo    │    │  Nomba API   │    │  Banks    │
│  Backend │    │  Gateway     │    │           │
├──────────┤    ├──────────────┤    ├───────────┤
│          │    │              │    │           │
│ ● Initiate│───▶│ ● Payment   │───▶│ ● Process │
│   Payment│    │   Request    │    │   Payment │
│          │    │              │    │           │
│ ● Verify │◀───│ ● Payment   │    │           │
│   Payment│    │   Status     │    │           │
│          │    │              │    │           │
│ ● Webhook│◀───│ ● Event     │    │           │
│   Handler│    │   Callback   │    │           │
│          │    │              │    │           │
│ ● Virtual│───▶│ ● Create VA  │───▶│ ● Generate│
│   Account│    │              │    │   Acct No │
│          │    │              │    │           │
│ ● Tranfer│───▶│ ● Transfer   │───▶│ ● Send    │
│          │    │   Request    │    │   Money   │
└──────────┘    └──────────────┘    └───────────┘
```

---

## Authentication

Nomba uses OAuth2 client credentials for API authentication:

```
┌────────────┐                    ┌──────────┐
│  Kolo      │                    │  Nomba   │
│            │                    │          │
│── POST ────▶ /auth/token        │          │
│  client_id  │                    │          │
│  private_key│                    │          │
│            │◀─── access_token ────┤          │
│            │     (1hr expiry)    │          │
│            │                    │          │
│── API call ─────────────────────▶│          │
│  Bearer    │                    │          │
│  token     │                    │          │
└────────────┘                    └──────────┘
```

- Token cached in Redis with 55-minute TTL
- Auto-refreshes when expired
- Separate credentials for test and live environments

---

## Configuration

```env
NOMBA_ENVIRONMENT=test           # or "live"
NOMBA_PARENT_ACCOUNT_ID=parent_xxx
NOMBA_SUB_ACCOUNT_ID=sub_xxx
NOMBA_TEST_CLIENT_ID=test_xxx
NOMBA_TEST_PRIVATE_KEY=test_key_xxx
NOMBA_LIVE_CLIENT_ID=live_xxx
NOMBA_LIVE_PRIVATE_KEY=live_key_xxx
NOMBA_WEBHOOK_SECRET=whsec_xxx
NOMBA_BASE_URL=https://api.nomba.com/v1
NOMBA_TRANSFER_BASE_URL=https://api.nomba.com/v1
```

---

## Payment Flow

```
1. User initiates payment on Kolo
           │
2. Kolo creates Payment record (status: INITIALIZED)
           │
3. Kolo calls NombaPayment.initiatePayment(amount, reference, callbackUrl)
           │
4. Nomba returns paymentUrl (redirect URL)
           │
5. User redirected to Nomba checkout page
           │
6. User completes payment (card, bank, USSD)
           │
7. Nomba sends webhook to Kolo
           │
8. Kolo verifies HMAC signature
           │
9. Kolo checks for duplicate event
           │
10. Kolo stores WebhookEvent (status: RECEIVED)
           │
11. Kolo enqueues nomba-webhook job
           │
12. Job processor calls NombaPayment.verifyPayment(providerReference)
           │
13. If confirmed:
    ├── Update Payment (status: SUCCESSFUL)
    ├── Create Transaction
    ├── Credit group wallet (atomic increment)
    ├── Credit platform wallet (fee)
    ├── Update MemberContribution (status: PAID)
    └── Send notification
           │
14. If failed:
    ├── Update Payment (status: FAILED)
    └── Send failure notification
```

---

## Virtual Accounts

Kolo uses Nomba virtual accounts to receive bank transfers:

```
1. User selects "Bank Transfer" payment method
           │
2. Kolo checks if virtual account exists for this user+group
           │
3. If not, Kolo calls NombaVirtualAccount.create(ownerId, ownerType, bvn?)
           │
4. Nomba returns account details:
   { accountNumber: "0123456789", accountName: "Kolo/Chioma Okafor", bankName: "Providus Bank" }
           │
5. Kolo stores VirtualAccount record (status: ACTIVE)
           │
6. User sees account number on payment page
           │
7. User transfers money from their bank app
           │
8. Nomba sends webhook: virtual_account_transaction
           │
9. Kolo processes: match to user, credit wallet
```

---

## Transfers

Kolo uses Nomba transfers for payouts:

```
1. Group admin creates and approves payout
           │
2. Kolo initiates transfer via NombaTransfer.createTransfer(
     amount,
     destinationAccount: { bankCode, accountNumber },
     reference
   )
           │
3. Nomba queues the transfer for processing
           │
4. Kolo stores transfer reference on PayoutRecipient
           │
5. Nomba sends webhook: transfer_success or transfer.failed
           │
6. Kolo updates recipient status
           │
7. If successful: mark payout as completed, send receipt
           │
8. If failed: increment retry count, retry up to 3 times
```

---

## Webhook Verification

Every Nomba webhook is verified using HMAC-SHA256:

```typescript
class NombaWebhook {
  verifySignature(payload: string, signature: string, timestamp: string): boolean {
    const expected = crypto
      .createHmac("sha256", this.webhookSecret)
      .update(`${timestamp}.${payload}`)
      .digest("hex");

    // Timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature)
    );
  }
}
```

### Webhook Processing Pipeline

```
HTTP POST /webhooks/nomba
  ├── Capture raw body (preParsing hook)
  ├── Extract x-nomba-signature, x-nomba-timestamp headers
  ├── Verify signature → 401 if invalid
  ├── Check for duplicate (by eventId, signature, payload content)
  ├── Store WebhookEvent
  └── Enqueue nomba-webhook job (async)
        │
        ▼
  Process stored webhook
    ├── payment.success → PaymentService.verifyAndCompletePayment()
    ├── charge.success → PaymentService.verifyAndCompletePayment()
    ├── payment.failed → Mark payment as failed
    ├── payment_reversal → Handle reversal
    ├── transfer_success → Mark payout as completed
    ├── transfer.failed → Retry or mark as failed
    ├── virtual_account_created → Activate virtual account
    └── virtual_account_transaction → Match and credit
```

---

## Duplicate Detection

Webhook events are deduplicated at multiple levels:

1. **Provider event ID** — Unique constraint on `[provider, eventId]`
2. **Signature replay window** — Same signature within 5 minutes is rejected
3. **Payload content** — Same payment reference and status is rejected

---

## Error Handling & Retry

| Scenario | Behavior |
|---|---|
| API returns 401 | Refresh token, retry request |
| API returns 408/429/5xx | Retry with exponential backoff (max 3 attempts) |
| Network timeout | Retry after 30s |
| Webhook signature invalid | Log security event, return 401 |
| Payment verification failed | Schedule retry via background job |
| Transfer failed (provider) | Retry up to 3 times, then mark as failed |

---

## Nomba Files

| File | Class | Purpose |
|---|---|---|
| `integrations/nomba/nomba.client.ts` | `NombaClient` | HTTP client with auto-retry, token injection |
| `integrations/nomba/nomba.auth.ts` | `NombaAuthService` | OAuth2 token acquisition and caching |
| `integrations/nomba/nomba.payment.ts` | `NombaPayment` | Initiate, verify, lookup payments |
| `integrations/nomba/nomba.transfer.ts` | `NombaTransfer` | Create transfer, check status, verify |
| `integrations/nomba/nomba.virtual-account.ts` | `NombaVirtualAccount` | Create, get, list, deactivate VAs |
| `integrations/nomba/nomba.webhook.ts` | `NombaWebhook` | HMAC signature verification |
| `services/nomba.service.ts` | `NombaService` | Orchestration facade |
