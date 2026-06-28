import type { Job } from "bullmq";
import type { JobProcessor, JobPayload } from "../queue-manager";
import { PaymentService } from "../../services/payment.service";
import { PaymentRepository } from "../../repositories/payment.repository";
import { Logger } from "../../logger/core/logger";

export class VerifyPaymentProcessor implements JobProcessor {
  private readonly paymentService: PaymentService;
  private readonly paymentRepository: PaymentRepository;
  private readonly logger: Logger;

  constructor() {
    this.paymentService = new PaymentService();
    this.paymentRepository = new PaymentRepository();
    this.logger = new Logger("payment-processor");
  }

  async process(job: Job<JobPayload>): Promise<void> {
    const { paymentId } = job.data;

    if (!paymentId) {
      throw new Error("Missing paymentId");
    }

    this.logger.info("Verifying payment", { jobId: job.id, paymentId: String(paymentId) });

    const payment = await this.paymentRepository.findById(String(paymentId));
    if (!payment) {
      this.logger.error("Payment not found for verification", { paymentId: String(paymentId) });
      return;
    }

    if (payment.status === "SUCCESSFUL") {
      this.logger.info("Payment already successful", { paymentId: String(paymentId) });
      return;
    }

    const reference = payment.providerReference ?? payment.id;
    await this.paymentService.verifyAndCompletePayment(String(paymentId), reference);

    this.logger.info("Payment verification completed", { paymentId: String(paymentId) });
  }
}

export class RetryFailedPaymentProcessor implements JobProcessor {
  private readonly paymentService: PaymentService;
  private readonly paymentRepository: PaymentRepository;
  private readonly logger: Logger;

  constructor() {
    this.paymentService = new PaymentService();
    this.paymentRepository = new PaymentRepository();
    this.logger = new Logger("payment-retry-processor");
  }

  async process(job: Job<JobPayload>): Promise<void> {
    const { paymentId } = job.data;

    if (!paymentId) {
      throw new Error("Missing paymentId");
    }

    this.logger.info("Retrying failed payment", { jobId: job.id, paymentId: String(paymentId) });

    const payment = await this.paymentRepository.findById(String(paymentId));
    if (!payment) {
      this.logger.error("Payment not found for retry", { paymentId: String(paymentId) });
      return;
    }

    if (payment.status === "SUCCESSFUL") {
      this.logger.info("Payment already successful, no retry needed", { paymentId: String(paymentId) });
      return;
    }

    const reference = payment.providerReference ?? payment.id;
    await this.paymentService.verifyAndCompletePayment(String(paymentId), reference);

    this.logger.info("Payment retry verification completed", { paymentId: String(paymentId) });
  }
}
