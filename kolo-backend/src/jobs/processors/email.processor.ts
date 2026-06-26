import type { Job } from "bullmq";
import type { JobProcessor, JobPayload } from "../queue-manager";
import { EmailTemplateService } from "../../integrations/email/email-template.service";
import { SmtpProvider } from "../../integrations/email/smtp.provider";
import { EmailLogRepository } from "../../repositories/email-log.repository";
import { UserRepository } from "../../repositories/user.repository";
import { Logger } from "../../logger/core/logger";

export class SendEmailProcessor implements JobProcessor {
  private readonly templateService: EmailTemplateService;
  private readonly provider: SmtpProvider;
  private readonly emailLogRepo: EmailLogRepository;
  private readonly userRepo: UserRepository;
  private readonly logger: Logger;

  constructor() {
    this.templateService = new EmailTemplateService();
    this.provider = new SmtpProvider();
    this.emailLogRepo = new EmailLogRepository();
    this.userRepo = new UserRepository();
    this.logger = new Logger("email-processor");
  }

  async process(job: Job<JobPayload>): Promise<void> {
    const { userId, template, vars } = job.data;

    if (!userId || !template) {
      throw new Error("Missing required fields: userId, template");
    }

    const user = await this.userRepo.findById(String(userId));
    if (!user?.email) {
      throw new Error(`User not found or missing email: ${userId}`);
    }

    const { subject, html, text } = this.templateService.render(String(template), (vars ?? {}) as Record<string, string>);

    const log = await this.emailLogRepo.create({
      userId: String(userId),
      template: String(template),
      recipient: user.email,
      status: "PENDING",
    });

    const result = await this.provider.send({ to: user.email, subject, html, text });

    if (result.success) {
      await this.emailLogRepo.updateStatus(log.id, "SENT", result.providerReference);
      this.logger.info("Email sent via job", { jobId: job.id, template, userId });
    } else {
      await this.emailLogRepo.updateStatus(log.id, "FAILED");
      this.logger.error("Email failed via job", { jobId: job.id, template, error: result.error });
      throw new Error(result.error ?? "Email send failed");
    }
  }
}
