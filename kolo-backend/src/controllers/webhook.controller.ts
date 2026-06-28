import type { FastifyReply, FastifyRequest } from "fastify";
import { WebhookService } from "../services/webhook.service";
import { ResponseUtil } from "../utils/response.util";
import { WebhookLogger } from "../logger/implementations/webhook.logger";
import { AppError } from "../errors/app.error";

export class WebhookController {
  private readonly webhookService: WebhookService;
  private readonly logger: WebhookLogger;

  constructor() {
    this.webhookService = new WebhookService();
    this.logger = new WebhookLogger();
  }

  async handleNomba(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const signature = (
      request.headers["x-nomba-signature"]
      ?? request.headers["nomba-signature"]
      ?? request.headers["x-signature"]
    ) as string | undefined;
    const timestamp = (
      request.headers["x-nomba-timestamp"]
      ?? request.headers["nomba-timestamp"]
      ?? request.headers["x-timestamp"]
    ) as string | undefined;
    const rawBody = (request as unknown as Record<string, string>).rawBody;
    if (!rawBody) {
      reply.status(400).send({ success: false, message: "Missing raw body" });
      return;
    }

    try {
      const result = await this.webhookService.processNombaWebhook(signature, rawBody, request.body as Record<string, unknown>, timestamp);
      ResponseUtil.success(reply, result);
    } catch (error) {
      if (error instanceof AppError) {
        if (error.statusCode === 401) {
          this.logger.log("Webhook signature verification failed", { error: error.message });
        } else if (error.statusCode === 422) {
          this.logger.log("Webhook payload validation failed", { error: error.message });
        }
        reply.status(error.statusCode).send({ success: false, message: error.message });
      } else {
        this.logger.log("Webhook processing error", { error: String(error) });
        reply.status(400).send({ success: false, message: "Webhook processing failed" });
      }
    }
  }
}
