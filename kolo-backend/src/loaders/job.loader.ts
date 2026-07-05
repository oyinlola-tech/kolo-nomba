import { QueueManager } from "../jobs/queue-manager";
import { SendEmailProcessor } from "../jobs/processors/email.processor";
import { Logger } from "../logger/core/logger";

export class JobLoader {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("job-loader");
  }

  load(): void {
    const queueManager = QueueManager.getInstance();

    // Create and register email queue
    const emailQueue = queueManager.createQueue("email.queue");
    queueManager.registerProcessor("email.queue", new SendEmailProcessor());
    queueManager.createWorker("email.queue");

    this.logger.info("Job queues initialized", { queues: ["email.queue"] });
  }
}

