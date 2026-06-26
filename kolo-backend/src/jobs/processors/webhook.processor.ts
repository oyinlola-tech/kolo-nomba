import type { Job } from "bullmq";
import type { JobProcessor, JobPayload } from "../queue-manager";
import { WebhookService } from "../../services/webhook.service";
import { Logger } from "../../logger/core/logger";

export class ProcessWebhookProcessor implements JobProcessor {
  private readonly webhookService: WebhookService;
  private readonly logger: Logger;

  constructor() {
    this.webhookService = new WebhookService();
    this.logger = new Logger("webhook-processor");
  }

  async process(job: Job<JobPayload>): Promise<void> {
    const { provider, eventType, payload, webhookId } = job.data;

    if (!provider || !eventType) {
      throw new Error("Missing required fields: provider, eventType");
    }

    this.logger.info("Processing webhook", { jobId: job.id, provider: String(provider), eventType: String(eventType) });

    if (String(provider) === "nomba") {
      if (webhookId) {
        await this.webhookService.processStoredNombaWebhook(String(webhookId));
      } else if (payload) {
        throw new Error("Nomba webhooks must be stored before processing");
      }
    }

    this.logger.info("Webhook processed", { jobId: job.id, provider: String(provider), eventType: String(eventType) });
  }
}
