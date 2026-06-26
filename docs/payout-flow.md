# Payout Flow

This document explains how withdrawals work in Kolo — from initiation and approval to transfer processing and ledger updates.

---

## Payout Lifecycle

```mermaid
stateDiagram-v2
    [*] --> PENDING: Created by admin
    PENDING --> APPROVED: Approver approves
    PENDING --> REJECTED: Approver rejects
    PENDING --> CANCELLED: Admin cancels
    APPROVED --> PROCESSING: Admin processes
    PROCESSING --> SUCCESSFUL: All transfers succeed
    PROCESSING --> FAILED: All transfers fail
    PROCESSING --> PARTIAL_FAIL: Some transfers fail
    SUCCESSFUL --> COMPLETED: Fully reconciled
    FAILED --> PROCESSING: Retry
    PARTIAL_FAIL --> PROCESSING: Retry failed ones
    REJECTED --> [*]
    CANCELLED --> [*]
    COMPLETED --> [*]

    note right of PENDING: Awaiting approval
    note right of APPROVED: Ready to process
    note right of PROCESSING: Transfers being sent
```

---

## Payout Approval Workflow

```mermaid
sequenceDiagram
    participant Admin as Group Admin
    participant Kolo as Kolo API
    participant Approver as Approver
    participant Queue as BullMQ
    participant Nomba as Nomba API
    participant DB as PostgreSQL

    Admin->>Kolo: Create payout (recipients, amounts, reason)
    Kolo->>DB: Create Payout (status: PENDING)
    Kolo->>DB: Create PayoutRecipients
    Kolo-->>Admin: Payout created

    Approver->>Kolo: Review & approve payout
    Kolo->>DB: Update Payout (status: APPROVED, approvedBy)
    Kolo-->>Approver: Approved

    Admin->>Kolo: Process payout
    Kolo->>DB: Check group wallet balance
    alt Insufficient balance
        Kolo-->>Admin: Error: insufficient funds
    else Sufficient balance
        Kolo->>DB: Atomic debit group wallet
        Kolo->>DB: Update Payout (status: PROCESSING)
        Kolo->>Nomba: createTransfer(amount, bank, account)
        Nomba-->>Kolo: { providerReference }
        Kolo->>DB: Store reference on PayoutRecipient
        Kolo->>Queue: Enqueue status check

        Nomba->>Kolo: Webhook: transfer_success
        Kolo->>DB: Update PayoutRecipient → SUCCESSFUL
        Kolo->>Kolo: Generate receipt
        Kolo-->>Admin: Notification
    end
```

---

## Money Movement

### Payout Flow Diagram

```
Group Wallet (₦500,000)
        │
        ▼
  Payout Created (₦200,000)
        │
        ├── Recipient 1 (Ada): ₦100,000
        │     └── Nomba Transfer → Ada's Bank Account
        │
        ├── Recipient 2 (Emeka): ₦60,000
        │     └── Nomba Transfer → Emeka's Bank Account
        │
        └── Recipient 3 (Tunde): ₦40,000
              └── Nomba Transfer → Tunde's Bank Account
```

### Ledger Impact

```
Before Payout:
  Group Wallet: ₦500,000

After Payout (₦200,000 total):
  Group Wallet: ₦300,000  (debited ₦200,000)

Ledger Entries:
  LedgerEntry 1:
    Wallet: Group Wallet
    Direction: OUT
    Amount: ₦200,000
    Balance: 500,000 → 300,000
    Description: "Payout to 3 members"

  FinancialTransaction:
    Type: PAYOUT
    Amount: ₦200,000
    Status: SUCCESSFUL
    Source: Group Wallet
    Destination: Various member bank accounts
```

---

## Transfer Processing

### Individual Transfer Flow

```mermaid
flowchart TB
    Start["PayoutProcessor picks up job"]
    Debit["Atomic debit group wallet\nUPDATE wallets SET balance = balance - amount"]
    CheckBalance{"balance >= amount?"}
    Insufficient["Mark payout FAILED\nNotify admin"]
    NombaCall["NombaTransfer.createTransfer()\n{ amount, bank, account, reference }"]
    StoreRef["Store Nomba reference\non PayoutRecipient"]
    UpdateProc["Update recipient: PROCESSING"]
    Webhook["Nomba webhook"]
    CheckSuccess{"transfer_success\nor\ntransfer.failed?"}
    Success["Update recipient: SUCCESSFUL\nGenerate receipt\nSend notification"]
    Retry{"retryCount < 3?"}
    IncRetry["Increment retryCount\nRe-queue for retry"]
    Fail["Credit wallet back (atomic)\nMark FAILED\nNotify admin"]

    Start --> Debit
    Debit --> CheckBalance
    CheckBalance -->|"No"| Insufficient
    CheckBalance -->|"Yes"| NombaCall
    NombaCall --> StoreRef
    StoreRef --> UpdateProc
    UpdateProc --> Webhook
    Webhook --> CheckSuccess
    CheckSuccess -->|"success"| Success
    CheckSuccess -->|"failed"| Retry
    Retry -->|"Yes"| IncRetry
    IncRetry --> NombaCall
    Retry -->|"No"| Fail
```

### Retry Logic

```
Transfer Failed
    │
    ├── Retry 1: After 60 seconds
    │       │
    │       ├── Success → Done
    │       └── Failure → Retry 2
    │
    ├── Retry 2: After 120 seconds
    │       │
    │       ├── Success → Done
    │       └── Failure → Retry 3
    │
    └── Retry 3: After 240 seconds
            │
            ├── Success → Done
            └── Failure → Mark as FAILED (final)
                          Credit wallet back
                          Notify admin
```

---

## Payout Types

### Manual Payout
- Admin creates payout on-demand
- Selects recipients manually
- One-time distribution

### Rotation Payout
- Automated rotating payout to members
- Each cycle, a different member receives the pot
- Configurable rotation order

### Custom Payout
- Admin-defined distribution rules
- Can specify amounts per recipient
- Supports partial distributions

### Scheduled Payout
- Recurring payout on a schedule
- Frequencies: weekly, monthly, custom interval
- Automatic execution via background job

---

## Payout States

```mermaid
stateDiagram-v2
    [*] --> PENDING
    PENDING --> APPROVED
    PENDING --> REJECTED
    PENDING --> CANCELLED
    APPROVED --> PROCESSING
    PROCESSING --> SUCCESSFUL
    PROCESSING --> PARTIAL_FAIL
    PROCESSING --> FAILED
    SUCCESSFUL --> COMPLETED
    FAILED --> [*]
    REJECTED --> [*]
    CANCELLED --> [*]
    COMPLETED --> [*]
```

| State | Description |
|---|---|
| `PENDING` | Created, awaiting approval |
| `APPROVED` | Approved, ready to process |
| `PROCESSING` | Transfers being sent |
| `SUCCESSFUL` | All transfers completed successfully |
| `COMPLETED` | Fully processed and reconciled |
| `FAILED` | All transfers failed, funds returned to wallet |
| `REJECTED` | Rejected by approver |
| `CANCELLED` | Cancelled before processing |

---

## Transfer Receipt

After a successful payout, Kolo generates a receipt:

```
KOLO Transfer Receipt
─────────────────────
Receipt: RCP-xxxxxxxx
Date: July 15, 2026
Group: Lagos Savings Circle

Transfer Details:
  Recipient: Ada Okafor
  Amount: ₦100,000
  Bank: Access Bank
  Account: ****1234
  Reference: KOLO-POUT-xxxxx
  Status: Successful

Powered by Nomba
```

---

## Payout Schedules

### Schedule Configuration

```json
{
  "type": "ROTATION",
  "frequency": "MONTHLY",
  "amount": 500000,
  "dayOfMonth": 15,
  "status": "ACTIVE"
}
```

### Schedule Execution

```
Cron job runs daily
        │
Check schedules with nextExecutionDate <= today
        │
For each schedule:
  ├── Create payout
  ├── Add recipients (rotation order)
  ├── Update nextExecutionDate
  └── Process automatically
```

---

## Payout Security

1. **Group Admin Check** — Only GROUP_OWNER/GROUP_ADMIN can create and process payouts
2. **Wallet Balance Check** — Payout creation validates sufficient balance
3. **Atomic Debit** — Group wallet is debited atomically; credited back on failure
4. **Duplicate Prevention** — Payout reference prevents double-processing
5. **Approval Workflow** — Multi-step approval for large payouts
6. **Recipient Account Verification** — Only verified accounts can receive payouts
7. **Audit Trail** — All payout actions logged with actor identity
