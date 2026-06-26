# Payment Flow

This document explains how money moves through the Kolo platform — from member contribution to group wallet credit.

---

## Payment Lifecycle

```mermaid
stateDiagram-v2
    [*] --> INITIALIZED: User initiates payment
    INITIALIZED --> PENDING: Redirected to Nomba
    PENDING --> VERIFYING: Nomba sends webhook
    VERIFYING --> SUCCESSFUL: Payment confirmed
    VERIFYING --> FAILED: Payment declined
    PENDING --> CANCELLED: User cancels
    SUCCESSFUL --> REFUNDED: Admin reverses
    FAILED --> PENDING: User retries
    SUCCESSFUL --> [*]
    FAILED --> [*]
    CANCELLED --> [*]
    REFUNDED --> [*]

    note right of INITIALIZED: Payment record created\nprovider not yet called
    note right of PENDING: Sent to Nomba\nawaiting user action
    note right of VERIFYING: Webhook received\nverifying with Nomba
    note right of SUCCESSFUL: Wallet credited\ncontribution updated
```

---

## Complete Money Movement

### Step-by-Step

```mermaid
sequenceDiagram
    participant User
    participant Kolo as Kolo API
    participant Nomba as Nomba Gateway
    participant DB as PostgreSQL
    participant Queue as BullMQ

    User->>Kolo: Initiate payment (₦10,000)
    Kolo->>DB: Create Payment (status: INITIALIZED)
    Kolo->>Nomba: initiatePayment(amount, reference)
    Nomba-->>Kolo: paymentUrl
    Kolo->>DB: Update Payment (status: PENDING)
    Kolo-->>User: Redirect URL

    User->>Nomba: Complete payment (card/bank/USSD)
    Nomba-->>User: Payment confirmation
    Nomba->>Kolo: POST /webhooks/nomba (HMAC signed)
    Kolo->>Kolo: Verify signature (HMAC-SHA256)
    Kolo->>Kolo: Check duplicate event
    Kolo->>DB: Store WebhookEvent
    Kolo->>Queue: Enqueue verification job

    Queue->>Kolo: VerifyPaymentProcessor
    Kolo->>Nomba: verifyPayment(reference)
    Nomba-->>Kolo: Confirmed (SUCCESSFUL)

    Kolo->>DB: Begin Prisma $transaction
    Kolo->>DB: Update Payment → SUCCESSFUL
    Kolo->>DB: Credit Group Wallet (atomic: +₦9,900)
    Kolo->>DB: Credit Platform Wallet (atomic: +₦100 fee)
    Kolo->>DB: Create FinancialTransaction (CONTRIBUTION)
    Kolo->>DB: Create LedgerEntry records
    Kolo->>DB: Update MemberContribution → PAID
    Kolo->>DB: Commit transaction
    Kolo->>Kolo: Publish payment.successful event
    Kolo->>Kolo: Send notification to user
    Kolo-->>User: Real-time update (dashboard)
```

### Atomic Wallet Operations

All wallet updates use database-level atomic operations to prevent race conditions:

```sql
-- Instead of read-modify-write:
-- SELECT balance FROM wallets WHERE id = 'group-wallet-id'
-- balance = balance + 9900
-- UPDATE wallets SET balance = 9900 WHERE id = 'group-wallet-id'

-- Kolo uses atomic increment:
UPDATE wallets
SET balance = balance + 9900
WHERE id = 'group-wallet-id'
RETURNING balance;
```

### Transactional Integrity

Multiple operations within a payment are wrapped in a Prisma transaction:

```typescript
await prisma.$transaction(async (tx) => {
  // 1. Update payment status
  await tx.payment.update({ where: { id }, data: { status: "SUCCESSFUL" } });

  // 2. Credit group wallet (atomic)
  await tx.wallet.update({
    where: { id: groupWalletId },
    data: { balance: { increment: netAmount } },
  });

  // 3. Credit platform wallet (atomic)
  await tx.wallet.update({
    where: { id: platformWalletId },
    data: { balance: { increment: feeAmount } },
  });

  // 4. Create FinancialTransaction
  await tx.financialTransaction.create({ ... });

  // 5. Create LedgerEntries
  await tx.ledgerEntry.createMany({ data: [...] });

  // 6. Update MemberContribution
  await tx.memberContribution.update({ where: { id }, data: { status: "PAID", paidAmount: amount } });
});
```

---

## Payment Methods

### 1. Bank Transfer (via Virtual Account)

```mermaid
sequenceDiagram
    participant User
    participant Kolo
    participant Nomba
    participant Bank as User's Bank

    User->>Kolo: Select "Bank Transfer"
    Kolo->>Nomba: createVirtualAccount(reference, ownerId)
    Nomba-->>Kolo: { accountNumber, accountName, bankName }
    Kolo->>DB: Store VirtualAccount (status: ACTIVE)
    Kolo-->>User: Display account number

    User->>Bank: Transfer from banking app
    Bank->>Nomba: Incoming transfer notification
    Nomba->>Kolo: Webhook: virtual_account_transaction
    Kolo->>Kolo: Match transfer to user
    Kolo->>DB: Credit wallet
```

### 2. Card Payment

```mermaid
sequenceDiagram
    participant User
    participant Kolo
    participant Nomba

    User->>Kolo: Select "Card Payment"
    Kolo->>Nomba: initiatePayment(amount, reference, callback)
    Nomba-->>Kolo: paymentUrl
    Kolo-->>User: Redirect to Nomba checkout
    User->>Nomba: Enter card details (secured by Nomba)
    Nomba->>Nomba: Process payment
    Nomba->>Kolo: Webhook: payment.success
    Kolo->>Kolo: Verify and credit wallet
```

### 3. Nomba Wallet

```mermaid
flowchart LR
    User["User selects\nNomba Wallet"]
    Login["User logs into\nNomba Wallet"]
    Confirm["User confirms\npayment"]
    Process["Nomba processes\npayment"]
    Webhook["Nomba sends\nwebhook"]
    Credit["Kolo verifies\nand credits wallet"]

    User --> Login
    Login --> Confirm
    Confirm --> Process
    Process --> Webhook
    Webhook --> Credit
```

---

## Fee Architecture

| Component | Rate | Maximum |
|---|---|---|
| Platform fee | 1% of contribution | ₦2,000 per transaction |
| Nomba processing fee | Varies by method | Nomba's standard rates |

### Fee Calculation

```typescript
class FeeEngine {
  calculateContributionFee(amount: number, currency: string): number {
    if (currency !== "NGN") return 0;
    const fee = Math.round(amount * 0.01); // 1%
    return Math.min(fee, 2000 * 100); // cap at ₦2,000 (in kobo)
  }
}
```

### Fee Examples

| Contribution Amount | Fee | Group Credit | Platform Revenue |
|---|---|---|---|
| ₦5,000 | ₦50 | ₦4,950 | ₦50 |
| ₦10,000 | ₦100 | ₦9,900 | ₦100 |
| ₦50,000 | ₦500 | ₦49,500 | ₦500 |
| ₦500,000 | ₦2,000 (capped) | ₦498,000 | ₦2,000 |

---

## Payment States

```mermaid
stateDiagram-v2
    [*] --> INITIALIZED
    INITIALIZED --> PENDING: Sent to Nomba
    PENDING --> SUCCESSFUL: Webhook confirmed
    PENDING --> FAILED: Webhook failure
    PENDING --> CANCELLED: User cancels
    FAILED --> PENDING: Retry
    FAILED --> FAILED: Max retries
    SUCCESSFUL --> REFUNDED: Admin refund
    FAILED --> [*]
    SUCCESSFUL --> [*]
    REFUNDED --> [*]
    CANCELLED --> [*]
```

| State | Description |
|---|---|
| `INITIALIZED` | Payment record created, not yet sent to provider |
| `PENDING` | Sent to provider, awaiting user action |
| `SUCCESSFUL` | Verified and completed |
| `FAILED` | Payment failed (can be retried) |
| `CANCELLED` | User cancelled before completion |
| `REFUNDED` | Payment was reversed/refunded |

---

## Payment Security

1. **Webhook Verification** — All payment confirmations come through HMAC-signed webhooks, never from the frontend
2. **Duplicate Detection** — Events are deduplicated by provider event ID, signature, and payload
3. **Atomic Operations** — Wallet credits use atomic increments to prevent race conditions
4. **Transaction Integrity** — Multi-step operations wrapped in database transactions
5. **Idempotency** — Payment references are unique, preventing double-processing
6. **Audit Trail** — Every payment state change is logged with full context
