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

```mermaid
flowchart TB
    subgraph Kolo["Kolo Backend"]
        NombaSvc["NombaService\n(Facade)"]
        NombaClient["NombaClient\n(HTTP with auto-retry)"]
        NombaAuth["NombaAuthService\n(OAuth2 Token Cache)"]
        NombaPayment["NombaPayment\n(Initiate, Verify)"]
        NombaTransfer["NombaTransfer\n(Create, Check Status)"]
        NombaVA["NombaVirtualAccount\n(Create, Get, Deactivate)"]
        NombaWH["NombaWebhook\n(HMAC Verification)"]
    end

    subgraph NombaAPI["Nomba API Gateway"]
        Auth["/auth/token\n(OAuth2)"]
        PaymentAPI["/payments/initiate\n/payments/verify"]
        TransferAPI["/transfers/send\n/transfers/{ref}/status"]
        VAAPI["/virtual-accounts"]
        WebhookAPI["Webhook Callback"]
    end

    subgraph External["External Systems"]
        Banks["Banking Partners"]
        Cards["Card Networks"]
        Wallets["Nomba Wallet"]
    end

    Kolo --> NombaAPI
    NombaClient --> NombaAuth
    NombaAuth --> Auth
    NombaPayment --> PaymentAPI
    NombaTransfer --> TransferAPI
    NombaVA --> VAAPI
    NombaWH --> WebhookAPI
    PaymentAPI --> Banks
    PaymentAPI --> Cards
    PaymentAPI --> Wallets
    TransferAPI --> Banks
```

---

## Authentication

Nomba uses OAuth2 client credentials for API authentication:

```mermaid
sequenceDiagram
    participant Kolo as Kolo Backend
    participant Redis as Redis Cache
    participant Nomba as Nomba API

    Kolo->>Redis: Check cached token
    Redis-->>Kolo: Cache miss / expired

    Kolo->>Nomba: POST /auth/token
    Note over Kolo,Nomba: { client_id, private_key, accountId }
    Nomba-->>Kolo: { access_token, expires_in }

    Kolo->>Redis: Cache token (TTL: 55 min)
    Kolo->>Nomba: API call with Bearer token
    Note over Kolo,Nomba: Automatic retry on 401

    Kolo->>Redis: Invalidated & refreshed
    Kolo->>Nomba: POST /auth/token (new)
    Nomba-->>Kolo: New access token
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

```mermaid
sequenceDiagram
    participant User
    participant Kolo as Kolo Backend
    participant Nomba as Nomba API
    participant Queue as BullMQ
    participant DB as PostgreSQL

    User->>Kolo: Initiate payment
    Kolo->>DB: Create Payment (status: INITIALIZED)
    Kolo->>Nomba: initiatePayment(amount, reference, callbackUrl)
    Nomba-->>Kolo: { paymentUrl }

    Kolo->>DB: Update Payment (status: PENDING)
    Kolo-->>User: Redirect to Nomba checkout

    User->>Nomba: Complete payment (card/bank/USSD)
    Nomba-->>User: Payment confirmation

    Nomba->>Kolo: POST webhook (HMAC signed)
    Kolo->>Kolo: Verify HMAC signature
    Kolo->>Kolo: Check duplicate (eventId)
    Kolo->>DB: Store WebhookEvent (status: RECEIVED)
    Kolo->>Queue: Enqueue nomba-webhook job

    Queue->>Kolo: ProcessWebhookProcessor
    Kolo->>Nomba: verifyPayment(providerReference)
    Nomba-->>Kolo: Confirmed / Failed

    alt Confirmed
        Kolo->>DB: $transaction
        Kolo->>DB: Update Payment → SUCCESSFUL
        Kolo->>DB: Create Transaction
        Kolo->>DB: Atomic wallet credit (group)
        Kolo->>DB: Atomic wallet credit (platform fee)
        Kolo->>DB: Update MemberContribution → PAID
        Kolo->>Kolo: Publish event + send notification
        Kolo-->>User: Dashboard update
    else Failed
        Kolo->>DB: Update Payment → FAILED
        Kolo->>Kolo: Send failure notification
    end
```

---

## Virtual Accounts

Kolo uses Nomba virtual accounts to receive bank transfers:

```mermaid
sequenceDiagram
    participant User
    participant Kolo as Kolo Backend
    participant Nomba as Nomba API
    participant DB as PostgreSQL

    User->>Kolo: Select "Bank Transfer"
    Kolo->>DB: Check existing VA for user+group
    alt No VA exists
        Kolo->>Nomba: createVirtualAccount(reference, accountName, owner)
        Nomba-->>Kolo: { accountNumber, accountName, bankName }
        Kolo->>DB: Store VirtualAccount (status: ACTIVE)
    end
    Kolo-->>User: Display account details

    User->>User's Bank: Transfer money
    User's Bank->>Nomba: Incoming transfer
    Nomba->>Kolo: Webhook: virtual_account_transaction
    Kolo->>Kolo: Match transfer to user via VirtualAccount
    Kolo->>DB: Credit wallet
    Kolo->>Kolo: Send notification
```

---

## Transfers

Kolo uses Nomba transfers for payouts:

```mermaid
sequenceDiagram
    participant Admin as Group Admin
    participant Kolo as Kolo Backend
    participant Nomba as Nomba API
    participant Queue as BullMQ
    participant DB as PostgreSQL

    Admin->>Kolo: Create & approve payout
    Kolo->>DB: Debit group wallet (atomic)
    Kolo->>Nomba: createTransfer(amount, account, bank, reference)
    Nomba-->>Kolo: { providerReference, status }
    Kolo->>DB: Store reference on PayoutRecipient

    alt Transfer Success
        Nomba->>Kolo: Webhook: transfer_success
        Kolo->>DB: Update recipient → SUCCESSFUL
        Kolo->>Kolo: Generate receipt
        Kolo->>Admin: Notification
    else Transfer Failed
        Nomba->>Kolo: Webhook: transfer.failed
        Kolo->>Queue: Retry (exponential backoff, max 3)
        alt Max retries exhausted
            Kolo->>DB: Credit back group wallet
            Kolo->>DB: Mark FAILED
            Kolo->>Admin: Manual review required
        end
    end
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

```mermaid
flowchart TB
    subgraph Incoming["Webhook Reception"]
        Raw["Capture raw body\n(preParsing hook)"]
        Headers["Extract headers\nx-nomba-signature\nx-nomba-timestamp"]
        Verify["Verify HMAC-SHA256\nsignature"]
        Dup["Duplicate check\neventId / signature / payload"]
        Store["Store WebhookEvent\n(status: RECEIVED)"]
        Enqueue["Enqueue nomba-webhook\n(BullMQ)"]
    end

    subgraph Processing["Async Processing"]
        Process["ProcessWebhookProcessor"]
        Route{"Event Type"}
    end

    subgraph Actions["Actions"]
        PaySuccess["payment.success / charge.success\n→ verifyAndCompletePayment()"]
        PayFailed["payment.failed\n→ Mark payment as FAILED"]
        Reversal["payment_reversal\n→ Handle reversal"]
        TransferOK["transfer_success\n→ Mark payout COMPLETED"]
        TransferFail["transfer.failed\n→ Retry or mark FAILED"]
        VA["virtual_account_created\n→ Activate VA"]
        VATxn["virtual_account_transaction\n→ Match and credit wallet"]
    end

    Raw --> Headers
    Headers --> Verify
    Verify -->|"Invalid → 401"| Reject["Reject"]
    Verify -->|"Valid"| Dup
    Dup -->|"Duplicate → 200"| Ignore["Ignore"]
    Dup -->|"New"| Store
    Store --> Enqueue
    Enqueue --> Process
    Process --> Route
    Route --> PaySuccess
    Route --> PayFailed
    Route --> Reversal
    Route --> TransferOK
    Route --> TransferFail
    Route --> VA
    Route --> VATxn
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

## Integration Files

```mermaid
flowchart LR
    subgraph Integrations["integrations/nomba/"]
        Client["nomba.client.ts\nNombaClient"]
        Auth["nomba.auth.ts\nNombaAuthService"]
        Payment["nomba.payment.ts\nNombaPayment"]
        Transfer["nomba.transfer.ts\nNombaTransfer"]
        VA["nomba.virtual-account.ts\nNombaVirtualAccount"]
        Webhook["nomba.webhook.ts\nNombaWebhook"]
    end

    subgraph Service["services/"]
        Facade["nomba.service.ts\nNombaService (Facade)"]
    end

    Facade --> Client
    Facade --> Auth
    Facade --> Payment
    Facade --> Transfer
    Facade --> VA
    Facade --> Webhook
    Client --> Auth
    Payment --> Client
    Transfer --> Client
    VA --> Client
```

| File | Class | Purpose |
|---|---|---|
| `integrations/nomba/nomba.client.ts` | `NombaClient` | HTTP client with auto-retry, token injection |
| `integrations/nomba/nomba.auth.ts` | `NombaAuthService` | OAuth2 token acquisition and Redis caching |
| `integrations/nomba/nomba.payment.ts` | `NombaPayment` | Initiate, verify, lookup payments |
| `integrations/nomba/nomba.transfer.ts` | `NombaTransfer` | Create transfer, check status, verify |
| `integrations/nomba/nomba.virtual-account.ts` | `NombaVirtualAccount` | Create, get, list, deactivate VAs |
| `integrations/nomba/nomba.webhook.ts` | `NombaWebhook` | HMAC-SHA256 signature verification |
| `services/nomba.service.ts` | `NombaService` | Orchestration facade for all Nomba operations |
