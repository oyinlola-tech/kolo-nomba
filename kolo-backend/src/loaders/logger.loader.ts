import { Logger } from "../logger/core/logger";

export class LoggerLoader {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("loader");
  }

  load(): Logger {
    this.logger.info("Logger initialized");
    return this.logger;
  }
}
