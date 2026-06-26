import { Logger } from "../core/logger";
import type { LogMeta } from "../core/log.types";

export class SecurityLogger {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("security");
  }

  log(event: string, meta?: LogMeta): void {
    this.logger.warn(`Security: ${event}`, meta);
  }
}
