import { Logger } from "../core/logger";
import type { LogMeta } from "../core/log.types";

export class NombaTransferLogger {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("nomba-transfer");
  }

  log(event: string, meta?: LogMeta): void {
    this.logger.info(`NombaTransfer: ${event}`, meta);
  }

  warn(event: string, meta?: LogMeta): void {
    this.logger.warn(`NombaTransfer: ${event}`, meta);
  }

  error(event: string, meta?: LogMeta): void {
    this.logger.error(`NombaTransfer: ${event}`, meta);
  }
}
