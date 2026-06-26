# Queue System

This document describes the background job system in Kolo — built on **BullMQ** with **Redis** for reliable asynchronous processing.

---

## Architecture

```mermaid
flowchart TB
    subgraph Producers["Job Producers"]
        Scheduler["JobScheduler\n(Cron-based)"]
        Services["Service Layer\n(Business Logic)"]
        Webhook["Webhook Handler"]
    end

    subgraph QueueManager["QueueManager (Singleton)"]
        Q1["email.queue"]
        Q2["notification.queue"]
        Q3["payment.queue"]
        Q4["webhook.queue"]
        Q5["nomba-payment"]
        Q6["nomba-webhook"]
        Q7["nomba-transfer"]
        Q8["nomba-reconciliation"]
        Q9["contribution.queue"]
        Q10["payout.queue"]
        Q11["reconciliation.queue"]
        Q12["report.queue"]
        Q13["analytics.queue"]
        Q14["security.queue"]
    end

    subgraph Redis["Redis (BullMQ)"]
        Jobs["Waiting Jobs"]
        Active["Active Jobs"]
        Completed["Completed Jobs"]
        Failed["Failed Jobs"]
    end

    subgraph Workers["Workers (5 concurrency each)"]
        W1["SendEmailProcessor"]
        W2["SendNotificationProcessor"]
        W3["VerifyPaymentProcessor"]
        W4["ProcessWebhookProcessor"]
        W5["ProcessPayoutTransferProcessor"]
        W6["CheckOverdueProcessor"]
        W7["SyncTransactionsProcessor"]
        W8["GenerateUserReportProcessor"]
        W9["UpdatePlatformMetricsProcessor"]
        W10["AnalyzeSecurityEventsProcessor"]
    end

    subgraph Database["Status Persistence"]
        BG["BackgroundJob Table\n(jobId, queue, type, status)"]
    end

    Scheduler -->|"Repeatable Jobs"| Q3
    Scheduler -->|"Repeatable Jobs"| Q10
    Scheduler -->|"Repeatable Jobs"| Q9
    Scheduler -->|"Repeatable Jobs"| Q12
    Scheduler -->|"Repeatable Jobs"| Q13
    Scheduler -->|"Repeatable Jobs"| Q14
    Services -->|"Add Job"| Q1
    Services -->|"Add Job"| Q2
    Services -->|"Add Job"| Q3
    Services -->|"Add Job"| Q10
    Webhook -->|"Enqueue"| Q4

    Q1 --> Redis
    Q2 --> Redis
    Q3 --> Redis
    Q4 --> Redis
    Q5 --> Redis
    Q6 --> Redis
    Q7 --> Redis
    Q8 --> Redis
    Q9 --> Redis
    Q10 --> Redis
    Q11 --> Redis
    Q12 --> Redis
    Q13 --> Redis
    Q14 --> Redis

    Redis --> W1
    Redis --> W2
    Redis --> W3
    Redis --> W4
    Redis --> W5
    Redis --> W6
    Redis --> W7
    Redis --> W8
    Redis --> W9
    Redis --> W10

    W1 --> Database
    W2 --> Database
    W3 --> Database
    W4 --> Database
    W5 --> Database
    W6 --> Database
    W7 --> Database
    W8 --> Database
    W9 --> Database
    W10 --> Database
```

---

## Queue Definitions

### Standard Queues

| Queue Name | Processor | Purpose |
|---|---|---|
| `email.queue` | `SendEmailProcessor` | Render templates, send via SMTP, track delivery |
| `notification.queue` | `SendNotificationProcessor` | Multi-channel dispatch (in-app + email + SMS/WhatsApp) |
| `payment.queue` | `VerifyPaymentProcessor` | Re-check pending/failed payment status |
| `webhook.queue` | `ProcessWebhookProcessor` | Parse and route Nomba webhook events |
| `contribution.queue` | `CheckOverdueProcessor` | Mark overdue contributions, send reminders |
| `payout.queue` | `ProcessPayoutTransferProcessor` | Initiate Nomba transfers for payouts |
| `reconciliation.queue` | `SyncTransactionsProcessor` | Sync provider transactions with internal records |
| `report.queue` | `GenerateUserReportProcessor` | Generate daily/weekly reports |
| `analytics.queue` | `UpdatePlatformMetricsProcessor` | Update platform analytics and aggregations |
| `security.queue` | `AnalyzeSecurityEventsProcessor` | Monitor security events, cleanup sessions |

### Nomba-Specific Queues

| Queue Name | Purpose |
|---|---|
| `nomba-auth` | Nomba OAuth2 token management |
| `nomba-payment` | Payment verification against Nomba |
| `nomba-webhook` | Nomba webhook processing |
| `nomba-transfer` | Transfer processing via Nomba |
| `nomba-reconciliation` | Nomba transaction reconciliation |

### Retry & Specialized Queues

| Queue Name | Processor | Purpose |
|---|---|---|
| `payment.queue.retry` | `RetryFailedPaymentProcessor` | Retry failed payment verifications |
| `payout.queue.retry` | `RetryFailedTransferProcessor` | Retry failed transfers (exponential backoff) |
| `payout.queue.status` | `CheckTransferStatusProcessor` | Check pending transfer statuses |
| `payout.queue.receipt` | `GeneratePayoutReceiptProcessor` | Generate payout receipts |
| `contribution.queue.reminder` | `SendReminderProcessor` | Send payment reminders |
| `contribution.queue.generate` | `GenerateCyclesProcessor` | Auto-generate contribution cycles |
| `reconciliation.queue.match` | `MatchTransactionsProcessor` | Match provider vs internal records |
| `reconciliation.queue.report` | `GenerateReconciliationReportProcessor` | Generate reconciliation reports |
| `report.queue.user` | `GenerateUserReportProcessor` | User-specific reports |
| `report.queue.group` | `GenerateGroupReportProcessor` | Group-specific reports |
| `report.queue.transaction` | `GenerateTransactionReportProcessor` | Transaction reports |
| `report.queue.revenue` | `GenerateRevenueReportProcessor` | Revenue reports |
| `analytics.queue.daily` | `CalculateDailyStatsProcessor` | Daily statistics calculation |
| `security.queue.cleanup` | `CleanupExpiredSessionsProcessor` | Remove expired sessions |

---

## Job Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Added: Service calls addJob()
    Added --> Waiting: Queue accepts
    Waiting --> Processing: Worker picks up
    Processing --> Completed: Processor succeeds
    Processing --> Failed: Processor throws error
    Failed --> Waiting: Retry (up to 3 attempts)
    Failed --> FailedPermanent: All retries exhausted
    Completed --> [*]
    FailedPermanent --> [*]
```

### Default Job Options

| Option | Value |
|---|---|
| Max attempts | 3 |
| Backoff type | Exponential |
| Backoff delay | 5,000ms (base) |
| Timeout | 30,000ms |
| Remove on complete | After 24 hours or 100 jobs |
| Remove on fail | After 7 days or 50 jobs |

---

## Scheduled (Cron) Jobs

| Job | Queue | Cron | Purpose |
|---|---|---|---|
| `UPDATE_PLATFORM_METRICS` | `analytics.queue` | Daily at midnight | Refresh platform metrics |
| `CHECK_OVERDUE_CONTRIBUTIONS` | `contribution.queue` | Daily at midnight | Mark overdue contributions |
| `VERIFY_PAYMENT` | `payment.queue` | Every hour | Re-check pending payments |
| `CHECK_PAYOUT_STATUS` | `payout.queue` | Every hour | Check pending transfer statuses |
| `CLEANUP_EXPIRED_SESSIONS` | `security.queue` | Daily at midnight | Remove expired sessions |
| `GENERATE_REVENUE_REPORT` | `report.queue` | Daily at 6 AM | Generate revenue report |

---

## Worker Configuration

```typescript
const worker = new Worker(
  queueName,
  async (job) => {
    // Processing logic
  },
  {
    connection: redis,      // IORedis connection
    prefix: "KOLO",         // Queue prefix
    concurrency: 5,         // Max 5 concurrent jobs
  }
);
```

| Property | Value |
|---|---|
| Connection | IORedis (same instance as QueueManager) |
| Prefix | `KOLO` (configurable via `QUEUE_PREFIX` env var) |
| Concurrency | 5 per worker |
| Retry on fail | Built into defaultJobOptions |

---

## Redis Connection

```typescript
const redisOpts = {
  host: env.REDIS_HOST,       // default: localhost
  port: env.REDIS_PORT,       // default: 6379
  db: env.REDIS_DB,           // default: 0
  password: env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};
```

Redis is used for:
1. **BullMQ Queue Storage** — Job persistence and state management
2. **Nomba Token Cache** — OAuth2 access tokens cached with 55-minute TTL
3. **Future use** — Rate limiting store, session cache

---

## Monitoring

The `BackgroundJob` table in PostgreSQL mirrors BullMQ job status for admin visibility:

| Column | Description |
|---|---|
| `jobId` | BullMQ job ID |
| `queue` | Queue name |
| `type` | Job type/name |
| `status` | WAITING, PROCESSING, COMPLETED, FAILED |
| `progress` | Percentage complete (0-100) |
| `error` | Error message on failure |
| `payload` | JSON job data |

Admin endpoints provide queue statistics (waiting, active, completed, failed counts) and the ability to retry failed jobs.
