import { QueueManager } from "./queue-manager";
import { JobScheduler } from "./scheduler";

import { SendEmailProcessor } from "./processors/email.processor";
import { SendNotificationProcessor } from "./processors/notification.processor";
import { VerifyPaymentProcessor, RetryFailedPaymentProcessor } from "./processors/payment.processor";
import { ProcessWebhookProcessor } from "./processors/webhook.processor";
import { GenerateCyclesProcessor, CheckOverdueProcessor, SendReminderProcessor } from "./processors/contribution.processor";
import { ProcessPayoutTransferProcessor, CheckTransferStatusProcessor, RetryFailedTransferProcessor, GeneratePayoutReceiptProcessor } from "./processors/payout.processor";
import { SyncTransactionsProcessor, MatchTransactionsProcessor, GenerateReconciliationReportProcessor } from "./processors/reconciliation.processor";
import { GenerateUserReportProcessor, GenerateGroupReportProcessor, GenerateTransactionReportProcessor, GenerateRevenueReportProcessor } from "./processors/report.processor";
import { UpdatePlatformMetricsProcessor, CalculateDailyStatsProcessor } from "./processors/analytics.processor";
import { AnalyzeSecurityEventsProcessor, CleanupExpiredSessionsProcessor, CleanupPendingUsersProcessor } from "./processors/security.processor";
import { Logger } from "../logger/core/logger";

export class JobLoader {
  private readonly queueManager: QueueManager;
  private readonly scheduler: JobScheduler;
  private readonly logger: Logger;

  constructor() {
    this.queueManager = QueueManager.getInstance();
    this.scheduler = new JobScheduler();
    this.logger = new Logger("job-loader");
  }

  async load(): Promise<void> {
    // Register all processors
    this.queueManager.registerProcessor("email.queue", new SendEmailProcessor());
    this.queueManager.registerProcessor("notification.queue", new SendNotificationProcessor());
    this.queueManager.registerProcessor("payment.queue", new VerifyPaymentProcessor());
    this.queueManager.registerProcessor("webhook.queue", new ProcessWebhookProcessor());
    this.queueManager.registerProcessor("nomba-payment", new VerifyPaymentProcessor());
    this.queueManager.registerProcessor("nomba-webhook", new ProcessWebhookProcessor());
    this.queueManager.registerProcessor("nomba-transfer", new ProcessPayoutTransferProcessor());
    this.queueManager.registerProcessor("nomba-reconciliation", new SyncTransactionsProcessor());
    this.queueManager.registerProcessor("contribution.queue", new CheckOverdueProcessor());
    this.queueManager.registerProcessor("payout.queue", new ProcessPayoutTransferProcessor());
    this.queueManager.registerProcessor("reconciliation.queue", new SyncTransactionsProcessor());
    this.queueManager.registerProcessor("report.queue", new GenerateUserReportProcessor());
    this.queueManager.registerProcessor("analytics.queue", new UpdatePlatformMetricsProcessor());
    this.queueManager.registerProcessor("security.queue", new AnalyzeSecurityEventsProcessor());

    // Create all queues
    this.queueManager.createQueue("email.queue");
    this.queueManager.createQueue("notification.queue");
    this.queueManager.createQueue("payment.queue");
    this.queueManager.createQueue("webhook.queue");
    this.queueManager.createQueue("nomba-auth");
    this.queueManager.createQueue("nomba-payment");
    this.queueManager.createQueue("nomba-webhook");
    this.queueManager.createQueue("nomba-transfer");
    this.queueManager.createQueue("nomba-reconciliation");
    this.queueManager.createQueue("contribution.queue");
    this.queueManager.createQueue("payout.queue");
    this.queueManager.createQueue("reconciliation.queue");
    this.queueManager.createQueue("report.queue");
    this.queueManager.createQueue("analytics.queue");
    this.queueManager.createQueue("security.queue");

    // Register additional processors for retry variants
    this.queueManager.createQueue("cleanup.queue");
    this.queueManager.registerProcessor("payment.queue.retry", new RetryFailedPaymentProcessor());
    this.queueManager.registerProcessor("payout.queue.retry", new RetryFailedTransferProcessor());
    this.queueManager.registerProcessor("payout.queue.status", new CheckTransferStatusProcessor());
    this.queueManager.registerProcessor("payout.queue.receipt", new GeneratePayoutReceiptProcessor());
    this.queueManager.registerProcessor("contribution.queue.reminder", new SendReminderProcessor());
    this.queueManager.registerProcessor("reconciliation.queue.match", new MatchTransactionsProcessor());
    this.queueManager.registerProcessor("reconciliation.queue.report", new GenerateReconciliationReportProcessor());
    this.queueManager.registerProcessor("report.queue.user", new GenerateUserReportProcessor());
    this.queueManager.registerProcessor("report.queue.group", new GenerateGroupReportProcessor());
    this.queueManager.registerProcessor("report.queue.transaction", new GenerateTransactionReportProcessor());
    this.queueManager.registerProcessor("report.queue.revenue", new GenerateRevenueReportProcessor());
    this.queueManager.registerProcessor("analytics.queue.daily", new CalculateDailyStatsProcessor());
    this.queueManager.registerProcessor("security.queue.cleanup", new CleanupExpiredSessionsProcessor());
    this.queueManager.registerProcessor("cleanup.queue", new CleanupPendingUsersProcessor());
    this.queueManager.registerProcessor("contribution.queue.generate", new GenerateCyclesProcessor());

    // Create workers for main queues
    this.queueManager.createWorker("email.queue");
    this.queueManager.createWorker("notification.queue");
    this.queueManager.createWorker("payment.queue");
    this.queueManager.createWorker("webhook.queue");
    this.queueManager.createWorker("nomba-payment");
    this.queueManager.createWorker("nomba-webhook");
    this.queueManager.createWorker("nomba-transfer");
    this.queueManager.createWorker("nomba-reconciliation");
    this.queueManager.createWorker("contribution.queue");
    this.queueManager.createWorker("payout.queue");
    this.queueManager.createWorker("reconciliation.queue");
    this.queueManager.createWorker("report.queue");
    this.queueManager.createWorker("analytics.queue");
    this.queueManager.createWorker("security.queue");
    this.queueManager.createWorker("cleanup.queue");

    // Register scheduled jobs
    await this.scheduler.registerSchedules();

    this.logger.info("All job queues, workers, and schedules initialized");
  }
}
