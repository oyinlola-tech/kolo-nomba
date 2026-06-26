import { EmailLogRepository } from "../repositories/email-log.repository";
import { NotificationDeliveryRepository } from "../repositories/notification-delivery.repository";
import { EmailTemplateService } from "../integrations/email/email-template.service";
import { SmtpProvider } from "../integrations/email/smtp.provider";
import type { EmailProvider } from "../integrations/email/email-provider.interface";
import { UserRepository } from "../repositories/user.repository";
import { Logger } from "../logger/core/logger";

export class EmailService {
  private readonly emailLogRepository: EmailLogRepository;
  private readonly deliveryRepository: NotificationDeliveryRepository;
  private readonly templateService: EmailTemplateService;
  private readonly provider: EmailProvider;
  private readonly userRepository: UserRepository;
  private readonly logger: Logger;

  constructor() {
    this.emailLogRepository = new EmailLogRepository();
    this.deliveryRepository = new NotificationDeliveryRepository();
    this.templateService = new EmailTemplateService();
    this.provider = new SmtpProvider();
    this.userRepository = new UserRepository();
    this.logger = new Logger("email-service");
  }

  async sendNotificationEmail(data: {
    userId: string;
    template: string;
    vars: Record<string, string>;
    deliveryId?: string;
  }): Promise<void> {
    const { subject, html, text } = this.templateService.render(data.template, data.vars);

    const user = await this.userRepository.findById(data.userId);
    const recipientEmail = user?.email ?? "unknown@kolo.app";

    const log = await this.emailLogRepository.create({
      userId: data.userId,
      template: data.template,
      recipient: recipientEmail,
      status: "PENDING",
    });

    try {
      this.logger.info("Sending email", { template: data.template, recipient: recipientEmail });
      const result = await this.provider.send({ to: recipientEmail, subject, html, text });

      if (result.success) {
        await this.emailLogRepository.updateStatus(log.id, "SENT", result.providerReference);
        if (data.deliveryId) {
          await this.deliveryRepository.updateStatus(data.deliveryId, "SENT", result.providerReference);
        }
        this.logger.info("Email sent", { template: data.template, logId: log.id });
      } else {
        await this.emailLogRepository.updateStatus(log.id, "FAILED");
        if (data.deliveryId) {
          await this.deliveryRepository.updateStatus(data.deliveryId, "FAILED", undefined, result.error);
        }
        this.logger.error("Email failed", { template: data.template, logId: log.id, error: result.error });
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error("Email service error", { template: data.template, error: msg });
      if (data.deliveryId) {
        await this.deliveryRepository.updateStatus(data.deliveryId, "FAILED", undefined, msg);
      }
    }
  }
}
