# Webhook Flow

This document describes how Kolo receives, validates, and processes webhook events from external providers — primarily the Nomba payment gateway.

---

## Webhook Processing Pipeline

```mermaid
flowchart TB
    subgraph Nomba["Nomba Gateway"]
        Event["Payment Event\nor Transfer Event"]
    end

    subgraph Kolo["Kolo Backend"]
        Endpoint["POST /webhooks/nomba\n(preParsing hook captures raw body)"]
        Verifier["NombaWebhook.verifySignature()\nHMAC-SHA256"]
        Dedup["Duplicate Detection\nby eventId + signature + payload"]
        Storage["WebhookEvent Stored\n(status: RECEIVED)"]
        Queue["nomba-webhook Queue\n(BullMQ)"]
        Processor["ProcessWebhookProcessor"]
        Router["Event Router"]
    end

    subgraph Actions["Business Actions"]
        PaySuccess["payment.success\n→ verify & complete"]
        PayFailed["payment.failed\n→ mark as failed"]
        PayReversal["payment_reversal\n→ handle reversal"]
        TransferSuccess["transfer_success\n→ mark payout complete"]
        TransferFailed["transfer.failed\n→ retry or mark failed"]
        VATransaction["virtual_account_transaction\n→ match & credit"]
    end

    Nomba -->|"HTTP POST\nx-nomba-signature\nx-nomba-timestamp"| Endpoint
    Endpoint --> Verifier
    Verifier -->|"Invalid → 401"| Endpoint
    Verifier -->|"Valid"| Dedup
    Dedup -->|"Duplicate → 200 OK (ignore)"| Endpoint
    Dedup -->|"New Event"| Storage
    Storage --> Queue
    Queue --> Processor
    Processor --> Router
    Router --> PaySuccess
    Router --> PayFailed
    Router --> PayReversal
    Router --> TransferSuccess
    Router --> TransferFailed
    Router --> VATransaction
```

---

## Sequence Diagram

```mermaid
sequenceDiagram
    participant Nomba as Nomba API
    participant Kolo as Kolo Backend
    participant WebhookSvc as Webhook Service
    participant Queue as BullMQ Queue
    participant PaymentSvc as Payment Service
    participant DB as PostgreSQL

    Nomba->>Kolo: POST /webhooks/nomba
    Note over Kolo: preParsing hook captures raw body
    Kolo->>Kolo: Extract x-nomba-signature header
    Kolo->>Kolo: Extract x-nomba-timestamp header

    Kolo->>WebhookSvc: verifySignature(payload, signature, timestamp)
    WebhookSvc-->>Kolo: Valid / Invalid

    alt Invalid Signature
        Kolo-->>Nomba: 401 Unauthorized
    else Valid Signature
        Kolo->>WebhookSvc: checkDuplicate(eventId, signature)
        WebhookSvc->>DB: Query webhook_events by provider+eventId
        DB-->>WebhookSvc: Existing / Not Found

        alt Duplicate Event
            Kolo-->>Nomba: 200 OK (ignored)
        else New Event
            WebhookSvc->>DB: Insert webhook_event (status: RECEIVED)
            DB-->>WebhookSvc: Created
            Kolo->>Queue: Add nomba-webhook job
            Kolo-->>Nomba: 200 OK (accepted)

            Queue->>PaymentSvc: ProcessWebhookProcessor

            alt payment.success / charge.success
                PaymentSvc->>PaymentSvc: verifyAndCompletePayment()
                PaymentSvc->>DB: Update payment → SUCCESSFUL
                PaymentSvc->>DB: Credit group wallet (atomic)
                PaymentSvc->>DB: Credit platform wallet (fee)
                PaymentSvc->>DB: Create FinancialTransaction
                PaymentSvc->>DB: Create LedgerEntries
                PaymentSvc->>DB: Update MemberContribution → PAID
                PaymentSvc->>DB: Mark webhook processed
                PaymentSvc->>PaymentSvc: Send notification
            else payment.failed
                PaymentSvc->>DB: Update payment → FAILED
                PaymentSvc->>PaymentSvc: Send failure notification
            else transfer_success
                PaymentSvc->>DB: Update payout_recipient → SUCCESSFUL
                PaymentSvc->>PaymentSvc: Generate receipt
            else transfer.failed
                PaymentSvc->>PaymentSvc: Retry up to 3 times
                alt All retries exhausted
                    PaymentSvc->>DB: Mark transfer FAILED
                    PaymentSvc->>DB: Credit back group wallet
                end
            end
        end
    end
```

---

## Signature Verification

```mermaid
flowchart LR
    Payload["Raw HTTP Body"]
    Timestamp["x-nomba-timestamp header"]
    Signature["x-nomba-signature header"]
    Secret["NOMBA_WEBHOOK_SECRET\n(env var)"]

    Concat["timestamp + '.' + payload"]
    HMAC["HMAC-SHA256\n(createHmac)"]
    Digest["hex digest"]
    TimingSafe["timingSafeEqual\ncomparison"]
    Result{"Valid?"}

    Payload --> Concat
    Timestamp --> Concat
    Concat --> HMAC
    Secret --> HMAC
    HMAC --> Digest
    Digest --> TimingSafe
    Signature --> TimingSafe
    TimingSafe --> Result
    Result -->|"Yes"| Process["Process Event"]
    Result -->|"No"| Reject["Reject (401)"]
```

Key properties of the webhook verification:
- **HMAC-SHA256** with the webhook secret
- **Timing-safe comparison** prevents timing attacks
- **Timestamp validation** with 5-minute tolerance window prevents replay attacks
- **Normalized signature** handles `sha256=` prefix if present

---

## Duplicate Detection

Webhook events are deduplicated at three levels:

| Level | Mechanism |
|---|---|
| **Provider Event ID** | Unique constraint on `[provider, eventId]` in `webhook_events` table |
| **Signature Replay** | Same signature within 5-minute timestamp window is rejected |
| **Payload Content** | Same payment reference and status combination is rejected |

---

## Webhook Event Model

```prisma
model WebhookEvent {
  id          String    @id @default(uuid())
  provider    String    @default("nomba")
  eventId     String?
  eventType   String
  payload     Json
  signature   String?
  status      String    @default("PENDING")
  processed   Boolean   @default(false)
  processedAt DateTime?
  createdAt   DateTime  @default(now())

  @@unique([provider, eventId])
  @@map("webhook_events")
}
```

---

## Error Handling

| Scenario | Response | Action |
|---|---|---|
| Missing signature header | 401 | Log security event |
| Invalid HMAC signature | 401 | Log security event |
| Expired timestamp (>5 min) | 401 | Log security event |
| Duplicate eventId | 200 OK | Ignore (idempotent) |
| Processing failure | 200 OK (accepted) | Retry via queue |
| Queue processing exhausted | — | Manual review required |
