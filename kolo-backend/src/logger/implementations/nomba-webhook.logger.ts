import { Logger } from "../core/logger";
import type { LogMeta } from "../core/log.types";

export class NombaWebhookLogger {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("nomba-webhook");
  }

  log(event: string, meta?: LogMeta): void {
    this.logger.info(`NombaWebhook: ${event}`, meta);
  }

  warn(event: string, meta?: LogMeta): void {
    this.logger.warn(`NombaWebhook: ${event}`, meta);
  }

  error(event: string, meta?: LogMeta): void {
    this.logger.error(`NombaWebhook: ${event}`, meta);
  }
}
