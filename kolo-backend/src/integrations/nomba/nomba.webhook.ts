import { EnvConfig } from "../../config/env.config";
import { WebhookLogger } from "../../logger/implementations/webhook.logger";
import { createHmac, timingSafeEqual } from "crypto";

export class NombaWebhook {
  private readonly config: EnvConfig;
  private readonly logger: WebhookLogger;

  constructor() {
    this.config = EnvConfig.getInstance();
    this.logger = new WebhookLogger();
  }

  verifySignature(signature: string | undefined, body: string, timestamp: string): boolean {
    if (!signature) {
      this.logger.log("Webhook signature missing");
      return false;
    }

    if (!timestamp) {
      this.logger.log("Webhook timestamp missing");
      return false;
    }

    const secret = this.config.NOMBA_WEBHOOK_SECRET;
    if (!secret) {
      this.logger.log("Webhook secret not configured");
      return false;
    }

    try {
      if (!this.isTimestampValid(timestamp)) {
        this.logger.log("Webhook timestamp outside tolerance");
        return false;
      }

      const signedPayload = `${timestamp}.${body}`;
      const expected = createHmac("sha256", secret)
        .update(signedPayload)
        .digest("hex");

      const normalizedSignature = signature.replace(/^sha256=/i, "");
      const received = Buffer.from(normalizedSignature);
      const calculated = Buffer.from(expected);
      return received.length === calculated.length && timingSafeEqual(received, calculated);
    } catch (error) {
      this.logger.log("Webhook signature verification failed", { error: String(error) });
      return false;
    }
  }

  private isTimestampValid(timestamp: string): boolean {
    const timestampMs = /^\d+$/.test(timestamp)
      ? Number(timestamp) * (timestamp.length === 10 ? 1000 : 1)
      : Date.parse(timestamp);
    if (!Number.isFinite(timestampMs)) return false;
    return Math.abs(Date.now() - timestampMs) <= 5 * 60 * 1000;
  }
}
