# Background Jobs

Kolo uses **BullMQ** with **Redis** for background job processing. All heavy or deferred work is moved off the API request path into dedicated queues.

## Architecture

```
QueueManager (singleton)
  ├── creates Queues (BullMQ)
  ├── registers Processors (JobProcessor interface)
  ├── creates Workers (one per queue)
  └── persists status to BackgroundJob model
```

- **QueueManager** (`src/jobs/queue-manager.ts`) — central factory for all queues/workers.
- **JobLoader** (`src/jobs/index.ts`) — wires everything on startup (processors → queues → workers → schedules).
- **JobScheduler** (`src/jobs/scheduler.ts`) — registers repeatable (cron) jobs.
- **BackgroundJobRepository** (`src/jobs/background-job.repository.ts`) — upserts job status to PostgreSQL for admin visibility.

## Queues & Processors

| Queue | Processor | Job Types | Purpose |
|-------|-----------|-----------|---------|
| `email.queue` | `SendEmailProcessor` | Renders template, sends via SMTP, tracks delivery |
| `notification.queue` | `SendNotificationProcessor` | Multi-channel dispatch (in-app + email + SMS/WhatsApp) |
| `payment.queue` | `VerifyPaymentProcessor` | `VERIFY_PAYMENT` | Re-check pending/failed payment status |
| `payment.queue.retry` | `RetryFailedPaymentProcessor` | Retry failed payment verification |
| `webhook.queue` | `ProcessWebhookProcessor` | Parse and route Nomba webhook events |
| `contribution.queue` | `CheckOverdueProcessor` | `CHECK_OVERDUE_CONTRIBUTIONS` | Mark overdue contributions |
| `contribution.queue.generate` | `GenerateCyclesProcessor` | Auto-generate contribution cycles |
| `contribution.queue.reminder` | `SendReminderProcessor` | Send contribution reminders |
| `payout.queue` | `ProcessPayoutProcessor` | Process approved payouts |
| `payout.queue.status` | `CheckPayoutStatusProcessor` | Check external payout status |
| `payout.queue.retry` | `RetryFailedPayoutProcessor` | Retry failed payouts |
| `reconciliation.queue` | `SyncTransactionsProcessor` | Sync transactions from provider |
| `reconciliation.queue.match` | `MatchTransactionsProcessor` | Match internal vs external records |
| `reconciliation.queue.report` | `GenerateReconciliationReportProcessor` | Generate reconciliation reports |
| `report.queue` | `GenerateUserReportProcessor` | Generate user CSV/PDF reports |
| `report.queue.group` | `GenerateGroupReportProcessor` | Generate group reports |
| `report.queue.transaction` | `GenerateTransactionReportProcessor` | Generate transaction reports |
| `report.queue.revenue` | `GenerateRevenueReportProcessor` | Generate revenue reports |
| `analytics.queue` | `UpdatePlatformMetricsProcessor` | `UPDATE_PLATFORM_METRICS` | Aggregate platform metrics |
| `analytics.queue.daily` | `CalculateDailyStatsProcessor` | Calculate daily statistics |
| `security.queue` | `AnalyzeSecurityEventsProcessor` | Analyze failed logins / suspicious activity |
| `security.queue.cleanup` | `CleanupExpiredSessionsProcessor` | `CLEANUP_EXPIRED_SESSIONS` | Delete expired sessions |

## Scheduled (Repeatable) Jobs

| Job ID | Cron | Queue | Type | Description |
|--------|------|-------|------|-------------|
| `daily-analytics-update` | `0 0 * * *` | `analytics.queue` | `UPDATE_PLATFORM_METRICS` | Daily platform metrics aggregation |
| `daily-overdue-check` | `0 0 * * *` | `contribution.queue` | `CHECK_OVERDUE_CONTRIBUTIONS` | Mark overdue contributions daily |
| `hourly-payment-check` | `0 * * * *` | `payment.queue` | `VERIFY_PAYMENT` | Re-check pending payments hourly |
| `hourly-payout-check` | `0 * * * *` | `payout.queue` | `CHECK_PAYOUT_STATUS` | Check pending payout status hourly |
| `daily-session-cleanup` | `0 0 * * *` | `security.queue` | `CLEANUP_EXPIRED_SESSIONS` | Purge expired sessions daily |
| `daily-revenue-report` | `0 6 * * *` | `report.queue` | `GENERATE_REVENUE_REPORT` | Generate daily revenue report at 6 AM |

## Job Payload Structure

All job payloads are typed as `JobPayload` (`Record<string, unknown>`) and typically include:

```typescript
{
  userId?: string;
  paymentId?: string;
  payoutId?: string;
  planId?: string;
  groupId?: string;
  template?: string;
  vars?: Record<string, string>;
  type?: string;
  title?: string;
  message?: string;
  metadata?: Record<string, unknown>;
  provider?: string;
  eventType?: string;
  payload?: Record<string, unknown>;
  startDate?: string;
  endDate?: string;
  filters?: Record<string, unknown>;
}
```

## Retry Configuration

- **Attempts**: `JOB_ATTEMPTS` env var (default: 3)
- **Backoff**: Exponential, starting at `JOB_BACKOFF_DELAY` ms (default: 5000)
- **Timeout**: `JOB_TIMEOUT` env var (default: 60000 ms)
- **Cleanup**: Completed jobs removed after 24h; failed jobs kept for 7 days

## Status Tracking

Every job is tracked in the `BackgroundJob` PostgreSQL model:

```
WAITING → PROCESSING → COMPLETED
                  ↓
                FAILED
```

Status is upserted by `BackgroundJobRepository` on start, completion, and failure.

## Admin Monitoring

- `GET /api/v1/admin/jobs` — list recent jobs (filterable by `status`, `queue`)
- `GET /api/v1/admin/jobs/:id` — get single job details
- `POST /api/v1/admin/jobs/:id/retry` — requeue a failed job
- `GET /api/v1/admin/jobs/queue-stats` — get queue counts (waiting/active/completed/failed) for all queues

All admin endpoints require `SUPER_ADMIN` role.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REDIS_HOST` | `localhost` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `REDIS_PASSWORD` | `""` | Redis password (optional) |
| `REDIS_DB` | `0` | Redis database index |
| `QUEUE_PREFIX` | `kolo` | BullMQ queue prefix |
| `JOB_ATTEMPTS` | `3` | Max retry attempts per job |
| `JOB_BACKOFF_DELAY` | `5000` | Initial backoff delay in ms |
| `JOB_TIMEOUT` | `60000` | Job timeout in ms |

## Graceful Shutdown

Call `QueueManager.getInstance().close()` to gracefully close all workers, queues, and the Redis connection.

## Adding a New Job

1. Create a processor class implementing `JobProcessor` in `src/jobs/processors/`
2. Register the processor and create the queue in `src/jobs/index.ts`
3. Create a worker for the queue
4. Optionally add a scheduled job in `src/jobs/scheduler.ts`
5. Enqueue jobs via `QueueManager.getInstance().addJob('queue.name', 'JOB_TYPE', payload)`

## Notes

- Redis must be running for queues/workers to initialize.
- If Redis is unavailable on startup, `JobLoader` logs a warning and continues — the app runs without background processing.
- The `ProcessPayoutProcessor`, `SyncTransactionsProcessor`, `MatchTransactionsProcessor`, and `GenerateReconciliationReportProcessor` are placeholder implementations that log their activity. Full implementation requires Nomba transfer API integration.
