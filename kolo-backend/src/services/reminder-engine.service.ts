import { NotificationService } from "./notification.service";
import { Logger } from "../logger/core/logger";

export class ReminderEngineService {
  private readonly notificationService: NotificationService;
  private readonly logger: Logger;

  constructor() {
    this.notificationService = new NotificationService();
    this.logger = new Logger("reminder-engine");
  }

  async sendOverdueReminders(): Promise<number> {
    // Placeholder: in production, query overdue contributions
    this.logger.info("Overdue reminder check completed", { sent: 0 });
    return 0;
  }

  async sendUpcomingReminders(): Promise<number> {
    // Placeholder: in production, query upcoming deadlines
    this.logger.info("Upcoming reminder check completed", { sent: 0 });
    return 0;
  }

  async notifyContributionReceived(contributionId: string, userId: string, amount: number): Promise<void> {
    await this.notificationService.create({
      userId,
      type: "CONTRIBUTION",
      title: "Contribution Received",
      message: `Your contribution of ${amount} NGN has been received.`,
      channel: "IN_APP",
      metadata: { contributionId, amount: String(amount) },
    });

    this.logger.info("Contribution received notification sent", { userId, contributionId });
  }
}
