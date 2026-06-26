import type { Job } from "bullmq";
import type { JobProcessor, JobPayload } from "../queue-manager";
import { Logger } from "../../logger/core/logger";

export class UpdatePlatformMetricsProcessor implements JobProcessor {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("analytics-metrics-processor");
  }

  async process(job: Job<JobPayload>): Promise<void> {
    this.logger.info("Updating platform metrics", { jobId: job.id });
    this.logger.info("Platform metrics updated", { jobId: job.id });
  }
}

export class CalculateDailyStatsProcessor implements JobProcessor {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("analytics-daily-processor");
  }

  async process(job: Job<JobPayload>): Promise<void> {
    this.logger.info("Calculating daily statistics", { jobId: job.id });
  }
}
