import { Logger } from "../core/logger";
import type { LogMeta } from "../core/log.types";

export class RequestLogger {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("request");
  }

  log(method: string, url: string, statusCode: number, durationMs: number, meta?: LogMeta): void {
    this.logger.info(`${method} ${url} ${statusCode} ${durationMs}ms`, { method, url, statusCode, durationMs, ...meta });
  }
}
