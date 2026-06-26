import { Logger } from "../logger/core/logger";

export class JobLoader {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("job-loader");
  }

  load(): void {
    this.logger.info("Job scheduler ready (not implemented in Phase 1)");
  }
}
