import { Logger } from "../core/logger";
import type { LogMeta } from "../core/log.types";

export class PaymentLogger {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("payment");
  }

  log(event: string, meta?: LogMeta): void {
    this.logger.info(`Payment: ${event}`, meta);
  }
}
