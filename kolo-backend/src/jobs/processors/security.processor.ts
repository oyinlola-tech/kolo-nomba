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

export class CleanupPendingUsersProcessor implements JobProcessor {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("cleanup-pending-users-processor");
  }

  async process(_job: Job<JobPayload>): Promise<void> {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - 24);

    const db = PrismaDatabase.getInstance().getClient();

    const pendingUsers = await db.user.findMany({
      where: { status: "PENDING", createdAt: { lt: cutoff } },
      select: { id: true },
    });

    if (pendingUsers.length === 0) {
      this.logger.info("No pending users to clean up");
      return;
    }

    const ids = pendingUsers.map(u => u.id);

    await db.otpCode.deleteMany({ where: { userId: { in: ids } } });
    const result = await db.user.deleteMany({ where: { id: { in: ids } } });

    this.logger.info("Pending users cleaned up", { count: result.count, cutoff: cutoff.toISOString() });
  }
}
