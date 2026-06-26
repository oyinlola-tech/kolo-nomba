import type { Job } from "bullmq";
import type { JobProcessor, JobPayload } from "../queue-manager";
import { PaymentService } from "../../services/payment.service";
import { Logger } from "../../logger/core/logger";

export class VerifyPaymentProcessor implements JobProcessor {
  private readonly paymentService: PaymentService;
  private readonly logger: Logger;

  constructor() {
    this.paymentService = new PaymentService();
    this.logger = new Logger("payment-processor");
  }

  async process(job: Job<JobPayload>): Promise<void> {
    const { paymentId } = job.data;

    if (!paymentId) {
      throw new Error("Missing paymentId");
    }

    this.logger.info("Verifying payment", { jobId: job.id, paymentId: String(paymentId) });

    const payment = await this.paymentService.getPayment(String(paymentId), "");
    this.logger.info("Payment status verified", { paymentId: String(paymentId), status: payment.status });
  }
}

export class RetryFailedPaymentProcessor implements JobProcessor {
  private readonly paymentService: PaymentService;
  private readonly logger: Logger;

  constructor() {
    this.paymentService = new PaymentService();
    this.logger = new Logger("payment-retry-processor");
  }

  async process(job: Job<JobPayload>): Promise<void> {
    const { paymentId } = job.data;

    if (!paymentId) {
      throw new Error("Missing paymentId");
    }

    this.logger.info("Retrying failed payment", { jobId: job.id, paymentId: String(paymentId) });

    const payment = await this.paymentService.getPayment(String(paymentId), "");
    this.logger.info("Payment retry status checked", { paymentId: String(paymentId), status: payment.status });
  }
}
