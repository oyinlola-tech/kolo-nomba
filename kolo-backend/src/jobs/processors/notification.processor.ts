import type { Job } from "bullmq";
import type { JobProcessor, JobPayload } from "../queue-manager";
import { NotificationRepository } from "../../repositories/notification.repository";
import { NotificationPreferenceRepository } from "../../repositories/notification-preference.repository";
import { NotificationDeliveryRepository } from "../../repositories/notification-delivery.repository";
import { ChannelResolver } from "../../integrations/channels/channel-resolver";
import { EmailService } from "../../services/email.service";
import type { NotificationPreferenceResponse } from "../../dto/notification.dto";
import { Logger } from "../../logger/core/logger";

export class SendNotificationProcessor implements JobProcessor {
  private readonly notificationRepo: NotificationRepository;
  private readonly prefRepo: NotificationPreferenceRepository;
  private readonly deliveryRepo: NotificationDeliveryRepository;
  private readonly channelResolver: ChannelResolver;
  private readonly emailService: EmailService;
  private readonly logger: Logger;

  constructor() {
    this.notificationRepo = new NotificationRepository();
    this.prefRepo = new NotificationPreferenceRepository();
    this.deliveryRepo = new NotificationDeliveryRepository();
    this.channelResolver = new ChannelResolver();
    this.emailService = new EmailService();
    this.logger = new Logger("notification-processor");
  }

  async process(job: Job<JobPayload>): Promise<void> {
    const { userId, type, title, message, metadata } = job.data;

    if (!userId || !type || !title) {
      throw new Error("Missing required fields: userId, type, title");
    }

    const notification = await this.notificationRepo.create({
      userId: String(userId),
      type: String(type),
      title: String(title),
      message: String(message ?? ""),
      channel: "IN_APP",
      metadata: metadata as Record<string, unknown> | undefined,
    });

    await this.notificationRepo.updateStatus(notification.id, "SENT");

    const prefs = await this.prefRepo.findByUser(String(userId));
    const prefsResponse: NotificationPreferenceResponse | null = prefs
      ? { emailEnabled: prefs.emailEnabled, smsEnabled: prefs.smsEnabled, pushEnabled: prefs.pushEnabled, whatsappEnabled: prefs.whatsappEnabled, securityAlerts: prefs.securityAlerts, paymentAlerts: prefs.paymentAlerts, marketingMessages: prefs.marketingMessages }
      : null;

    const channels = await this.channelResolver.resolve(String(type), prefsResponse);

    for (const channel of channels) {
      if (channel === "IN_APP") continue;

      const delivery = await this.deliveryRepo.create({
        notificationId: notification.id,
        channel,
        status: "PENDING",
      });

      try {
        if (channel === "EMAIL") {
          await this.emailService.sendNotificationEmail({
            userId: String(userId),
            template: this.mapTypeToTemplate(String(type)),
            vars: { title: String(title), message: String(message ?? ""), ...(metadata as Record<string, string> ?? {}) },
            deliveryId: delivery.id,
          });
        }
        await this.deliveryRepo.updateStatus(delivery.id, "SENT");
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        await this.deliveryRepo.updateStatus(delivery.id, "FAILED", undefined, reason);
      }
    }

    this.logger.info("Notification processed via job", { jobId: job.id, notificationId: notification.id });
  }

  private mapTypeToTemplate(type: string): string {
    const map: Record<string, string> = {
      PAYMENT: "paymentSuccessful",
      CONTRIBUTION: "contributionReminder",
      PAYOUT: "payoutCompleted",
      SECURITY: "securityAlert",
      SYSTEM: "welcome",
    };
    return map[type] ?? "welcome";
  }
}
