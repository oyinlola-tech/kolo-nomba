import type { Job } from "bullmq";
import type { JobProcessor, JobPayload } from "../queue-manager";
import { Logger } from "../../logger/core/logger";

export class GenerateUserReportProcessor implements JobProcessor {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("report-user-processor");
  }

  async process(job: Job<JobPayload>): Promise<void> {
    const { filters } = job.data;
    this.logger.info("Generating user report", { jobId: job.id, filters });
  }
}

export class GenerateGroupReportProcessor implements JobProcessor {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("report-group-processor");
  }

  async process(job: Job<JobPayload>): Promise<void> {
    const { groupId, filters } = job.data;
    this.logger.info("Generating group report", { jobId: job.id, groupId, filters });
  }
}

export class GenerateTransactionReportProcessor implements JobProcessor {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("report-transaction-processor");
  }

  async process(job: Job<JobPayload>): Promise<void> {
    const { startDate, endDate, filters } = job.data;
    this.logger.info("Generating transaction report", { jobId: job.id, startDate, endDate, filters });
  }
}

export class GenerateRevenueReportProcessor implements JobProcessor {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("report-revenue-processor");
  }

  async process(job: Job<JobPayload>): Promise<void> {
    const { startDate, endDate } = job.data;
    this.logger.info("Generating revenue report", { jobId: job.id, startDate, endDate });
  }
}
