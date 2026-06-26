import { Logger } from "../core/logger";
import type { LogMeta } from "../core/log.types";

export class AuditLogger {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("audit");
  }

  log(action: string, userId: string, meta?: LogMeta): void {
    this.logger.info(`Audit: ${action}`, { userId, ...meta });
  }
}
