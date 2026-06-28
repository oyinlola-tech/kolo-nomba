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
    const paymentId = String(job.data.paymentId ?? "");

    if (!paymentId) {
      this.logger.warn("VerifyPayment: missing paymentId in job", { jobId: job.id });
      return;
    }

    this.logger.info("Verifying payment", { jobId: job.id, paymentId });

    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      this.logger.error("Payment not found for verification", { paymentId });
      return;
    }

    if (payment.status === "SUCCESSFUL") {
      this.logger.info("Payment already successful, skipping", { paymentId });
      return;
    }

    if (payment.status === "CANCELLED") {
      this.logger.info("Payment cancelled, skipping verification", { paymentId });
      return;
    }

    const reference = payment.providerReference ?? payment.id;
    await this.paymentService.verifyAndCompletePayment(paymentId, reference);

    this.logger.info("Payment verification completed", { paymentId });
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
    const paymentId = String(job.data.paymentId ?? "");

    if (!paymentId) {
      this.logger.warn("RetryPayment: missing paymentId in job", { jobId: job.id });
      return;
    }

    this.logger.info("Retrying failed payment", { jobId: job.id, paymentId });

    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      this.logger.error("Payment not found for retry", { paymentId });
      return;
    }

    if (payment.status === "SUCCESSFUL") {
      this.logger.info("Payment already successful, no retry needed", { paymentId });
      return;
    }

    if (payment.status === "CANCELLED") {
      this.logger.info("Payment cancelled, skipping retry", { paymentId });
      return;
    }

    const reference = payment.providerReference ?? payment.id;
    await this.paymentService.verifyAndCompletePayment(paymentId, reference);

    this.logger.info("Payment retry completed", { paymentId });
  }
}
