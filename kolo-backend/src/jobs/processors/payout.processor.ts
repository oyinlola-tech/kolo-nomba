import type { Job } from "bullmq";
import type { JobProcessor, JobPayload } from "../queue-manager";
import { PayoutRecipientRepository } from "../../repositories/payout-recipient.repository";
import { WalletService } from "../../services/wallet.service";
import { TransferService } from "../../services/transfer.service";
import { PayoutService } from "../../services/payout.service";
import { QueueManager } from "../queue-manager";
import { EventBus } from "../../events/core/event-bus";
import { PayoutEvent } from "../../events/core/event";
import { Logger } from "../../logger/core/logger";

export class ProcessPayoutTransferProcessor implements JobProcessor {
  private readonly recipientRepo: PayoutRecipientRepository;
  private readonly transferService: TransferService;
  private readonly walletService: WalletService;
  private readonly queueManager: QueueManager;
  private readonly logger: Logger;

  constructor() {
    this.recipientRepo = new PayoutRecipientRepository();
    this.transferService = new TransferService();
    this.walletService = new WalletService();
    this.queueManager = QueueManager.getInstance();
    this.logger = new Logger("payout-transfer-processor");
  }

  async process(job: Job<JobPayload>): Promise<void> {
    const { recipientId, payoutId, groupId } = job.data;
    if (!recipientId) throw new Error("Missing recipientId");

    const recipient = await this.recipientRepo.findById(String(recipientId));
    if (!recipient) throw new Error(`Recipient not found: ${recipientId}`);

    this.logger.info("Processing payout transfer", { jobId: job.id, recipientId, amount: recipient.amount });

    if (recipient.status === "SUCCESSFUL") {
      this.logger.warn("Recipient already processed", { recipientId });
      return;
    }

    await this.recipientRepo.updateTransferDetails(recipient.id, {
      transferStatus: "PROCESSING",
      status: "PROCESSING",
    });

      try {
        const account = recipient.recipientAccount;
        if (!account && !recipient.destinationAccount) {
          throw new Error("No destination account for recipient");
        }

        const transferRef = `PO-${String(payoutId).slice(0, 8)}-${recipient.id.slice(0, 8)}`;

        const result = await this.transferService.initiateTransfer({
          amount: recipient.amount,
          currency: "NGN",
          reference: transferRef,
          destinationAccount: account?.accountNumber ?? recipient.destinationAccount ?? "",
          destinationBank: account?.bankName ?? "",
          accountName: account?.accountName ?? `${recipient.user.firstName} ${recipient.user.lastName}`,
          narration: `Payout to ${recipient.user.firstName} ${recipient.user.lastName}`,
        });

        const wallet = groupId ? await this.walletService.getOrCreateWallet("GROUP", String(groupId)) : null;
        if (wallet) {
          await this.walletService.debit(wallet.id, recipient.amount, `Payout recipient: ${recipient.userId}`);
        }

        await this.recipientRepo.updateTransferDetails(recipient.id, {
          transferReference: result.reference,
          providerReference: result.providerReference,
          transferStatus: result.status,
          status: result.status === "SUCCESSFUL" ? "SUCCESSFUL" : "PROCESSING",
          failureReason: undefined,
        });

      if (result.status !== "SUCCESSFUL") {
        await this.queueManager.addJob("payout.queue.status", "CHECK_TRANSFER_STATUS", {
          recipientId: recipient.id,
          transferReference: result.reference,
          payoutId,
          groupId,
        }, { delay: 60000 });
      }

      EventBus.getInstance().publish(new PayoutEvent("payout.transfer_processed", {
        payoutId,
        recipientId,
        status: result.status,
      }));

      this.logger.info("Payout transfer processed", { jobId: job.id, recipientId, status: result.status });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      await this.recipientRepo.updateTransferDetails(recipient.id, {
        status: "FAILED",
        transferStatus: "FAILED",
        failureReason: errMsg,
      });

      EventBus.getInstance().publish(new PayoutEvent("payout.transfer_failed", {
        payoutId,
        recipientId,
        error: errMsg,
      }));

      this.logger.error("Payout transfer failed", { jobId: job.id, recipientId, error: errMsg });
      throw error;
    }
  }
}

export class CheckTransferStatusProcessor implements JobProcessor {
  private readonly recipientRepo: PayoutRecipientRepository;
  private readonly transferService: TransferService;
  private readonly walletService: WalletService;
  private readonly queueManager: QueueManager;
  private readonly logger: Logger;

  constructor() {
    this.recipientRepo = new PayoutRecipientRepository();
    this.transferService = new TransferService();
    this.walletService = new WalletService();
    this.queueManager = QueueManager.getInstance();
    this.logger = new Logger("payout-check-status-processor");
  }

  async process(job: Job<JobPayload>): Promise<void> {
    const { recipientId, transferReference, groupId } = job.data;

    if (!recipientId || !transferReference) {
      this.logger.warn("Missing recipientId or transferReference", { jobId: job.id });
      return;
    }

    const recipient = await this.recipientRepo.findById(String(recipientId));
    if (!recipient) {
      this.logger.warn("Recipient not found for status check", { recipientId });
      return;
    }

    if (recipient.status === "SUCCESSFUL") {
      this.logger.warn("Recipient already successful", { recipientId });
      return;
    }

    const status = await this.transferService.checkTransferStatus(String(transferReference));

    if (status.status === "SUCCESSFUL") {
      await this.recipientRepo.updateStatus(String(recipientId), "SUCCESSFUL", status.providerReference);

      EventBus.getInstance().publish(new PayoutEvent("payout.transfer_completed", {
        recipientId,
        transferReference,
      }));
    } else if (status.status === "FAILED") {
      const currentRetry = recipient.retryCount ?? 0;
      const newRetry = currentRetry + 1;

      await this.recipientRepo.updateTransferDetails(String(recipientId), {
        transferStatus: "FAILED",
        failureReason: status.failureReason,
        retryCount: newRetry,
      });

      if (newRetry < 3) {
        await this.queueManager.addJob("payout.queue.retry", "RETRY_FAILED_TRANSFER", {
          recipientId,
          transferReference,
        }, { delay: newRetry * 60000 });
      } else {
        await this.recipientRepo.updateTransferDetails(String(recipientId), {
          status: "FAILED",
        });
        if (groupId) {
          const wallet = await this.walletService.getOrCreateWallet("GROUP", String(groupId));
          await this.walletService.credit(wallet.id, recipient.amount, `Payout reversal (max retries): ${recipientId}`);
        }
      }
    }

    this.logger.info("Transfer status checked", { jobId: job.id, recipientId, status: status.status });
  }
}

export class RetryFailedTransferProcessor implements JobProcessor {
  private readonly recipientRepo: PayoutRecipientRepository;
  private readonly logger: Logger;

  constructor() {
    this.recipientRepo = new PayoutRecipientRepository();
    this.logger = new Logger("payout-retry-transfer-processor");
  }

  async process(job: Job<JobPayload>): Promise<void> {
    const { recipientId } = job.data;
    if (!recipientId) throw new Error("Missing recipientId");

    const recipient = await this.recipientRepo.findById(String(recipientId));
    if (!recipient) throw new Error(`Recipient not found: ${recipientId}`);

    if (recipient.retryCount >= 3) {
      this.logger.warn("Max retries reached", { recipientId, retryCount: recipient.retryCount });
      return;
    }

    await this.recipientRepo.updateTransferDetails(recipient.id, {
      status: "PROCESSING",
      transferStatus: "PENDING",
      failureReason: undefined,
    });

    this.logger.info("Transfer queued for retry", { recipientId });
  }
}

export class GeneratePayoutReceiptProcessor implements JobProcessor {
  private readonly payoutService: PayoutService;
  private readonly logger: Logger;

  constructor() {
    this.payoutService = new PayoutService();
    this.logger = new Logger("payout-receipt-processor");
  }

  async process(job: Job<JobPayload>): Promise<void> {
    const { recipientId } = job.data;
    if (!recipientId) throw new Error("Missing recipientId");

    const receipt = await this.payoutService.generateTransferReceipt(String(recipientId));

    EventBus.getInstance().publish(new PayoutEvent("payout.receipt_generated", {
      recipientId,
      receiptNumber: receipt.receiptNumber,
      amount: receipt.amount,
    }));

    this.logger.info("Payout receipt generated", { jobId: job.id, recipientId, receiptNumber: receipt.receiptNumber });
  }
}
