import { Logger } from "../core/logger";
import type { LogMeta } from "../core/log.types";

export class WebhookLogger {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("webhook");
  }

  log(event: string, meta?: LogMeta): void {
    this.logger.info(`Webhook: ${event}`, meta);
  }
}
