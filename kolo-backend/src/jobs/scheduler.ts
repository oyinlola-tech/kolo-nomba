import { QueueManager } from "./queue-manager";
import { Logger } from "../logger/core/logger";

export class JobScheduler {
  private readonly queueManager: QueueManager;
  private readonly logger: Logger;

  constructor() {
    this.queueManager = QueueManager.getInstance();
    this.logger = new Logger("job-scheduler");
  }

  async registerSchedules(): Promise<void> {
    await this.scheduleAnalyticsUpdates();
    await this.scheduleOverdueChecks();
    await this.schedulePaymentChecks();
    await this.schedulePayoutStatusChecks();
    await this.scheduleSessionCleanup();
    await this.scheduleReportGeneration();
    this.logger.info("All scheduled jobs registered");
  }

  private async scheduleAnalyticsUpdates(): Promise<void> {
    await this.queueManager.addRepeatableJob(
      "analytics.queue",
      "UPDATE_PLATFORM_METRICS",
      {},
      "0 0 * * *",
      { jobId: "daily-analytics-update" },
    );
    this.logger.info("Scheduled daily analytics update");
  }

  private async scheduleOverdueChecks(): Promise<void> {
    await this.queueManager.addRepeatableJob(
      "contribution.queue",
      "CHECK_OVERDUE_CONTRIBUTIONS",
      { groupId: "all" },
      "0 0 * * *",
      { jobId: "daily-overdue-check" },
    );
    this.logger.info("Scheduled daily overdue check");
  }

  private async schedulePaymentChecks(): Promise<void> {
    await this.queueManager.addRepeatableJob(
      "payment.queue",
      "VERIFY_PAYMENT",
      {},
      "0 * * * *",
      { jobId: "hourly-payment-check" },
    );
    this.logger.info("Scheduled hourly payment check");
  }

  private async schedulePayoutStatusChecks(): Promise<void> {
    await this.queueManager.addRepeatableJob(
      "payout.queue",
      "CHECK_PAYOUT_STATUS",
      {},
      "0 * * * *",
      { jobId: "hourly-payout-check" },
    );
    this.logger.info("Scheduled hourly payout check");
  }

  private async scheduleSessionCleanup(): Promise<void> {
    await this.queueManager.addRepeatableJob(
      "security.queue",
      "CLEANUP_EXPIRED_SESSIONS",
      {},
      "0 0 * * *",
      { jobId: "daily-session-cleanup" },
    );
    this.logger.info("Scheduled daily session cleanup");
  }

  private async scheduleReportGeneration(): Promise<void> {
    await this.queueManager.addRepeatableJob(
      "report.queue",
      "GENERATE_REVENUE_REPORT",
      {},
      "0 6 * * *",
      { jobId: "daily-revenue-report" },
    );
    this.logger.info("Scheduled daily report generation");
  }
}
