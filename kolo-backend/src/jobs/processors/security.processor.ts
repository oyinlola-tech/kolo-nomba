import type { Job } from "bullmq";
import type { JobProcessor, JobPayload } from "../queue-manager";
import { PrismaDatabase } from "../../database/prisma";
import { Logger } from "../../logger/core/logger";

export class AnalyzeSecurityEventsProcessor implements JobProcessor {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("security-analysis-processor");
  }

  async process(job: Job<JobPayload>): Promise<void> {
    this.logger.info("Analyzing security events", { jobId: job.id });
  }
}

export class CleanupExpiredSessionsProcessor implements JobProcessor {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("security-cleanup-processor");
  }

  async process(_job: Job<JobPayload>): Promise<void> {
    const db = PrismaDatabase.getInstance().getClient();
    const result = await db.session.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    this.logger.info("Expired sessions cleaned up", { count: result.count });
  }
}
