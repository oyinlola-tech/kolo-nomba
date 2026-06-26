import type { Job } from "bullmq";
import type { JobProcessor, JobPayload } from "../queue-manager";
import { Logger } from "../../logger/core/logger";

export class GenerateCyclesProcessor implements JobProcessor {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("contribution-cycle-processor");
  }

  async process(job: Job<JobPayload>): Promise<void> {
    const { planId } = job.data;

    if (!planId) {
      throw new Error("Missing planId");
    }

    this.logger.info("Generating contribution cycles", { jobId: job.id, planId: String(planId) });
  }
}

export class CheckOverdueProcessor implements JobProcessor {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("contribution-overdue-processor");
  }

  async process(job: Job<JobPayload>): Promise<void> {
    const { groupId } = job.data;
    this.logger.info("Checking overdue contributions", { jobId: job.id, groupId });
  }
}

export class SendReminderProcessor implements JobProcessor {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("contribution-reminder-processor");
  }

  async process(job: Job<JobPayload>): Promise<void> {
    const { userId } = job.data;

    if (!userId) {
      throw new Error("Missing userId");
    }

    this.logger.info("Sending contribution reminder", {
      jobId: job.id,
      userId: String(userId),
    });
  }
}
