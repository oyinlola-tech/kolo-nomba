import { Logger } from "../core/logger";
import type { LogMeta } from "../core/log.types";

export class NombaPaymentLogger {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("nomba-payment");
  }

  log(event: string, meta?: LogMeta): void {
    this.logger.info(`NombaPayment: ${event}`, meta);
  }

  warn(event: string, meta?: LogMeta): void {
    this.logger.warn(`NombaPayment: ${event}`, meta);
  }

  error(event: string, meta?: LogMeta): void {
    this.logger.error(`NombaPayment: ${event}`, meta);
  }
}
