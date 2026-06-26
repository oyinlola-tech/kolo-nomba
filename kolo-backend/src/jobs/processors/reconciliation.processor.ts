import type { Job } from "bullmq";
import type { JobProcessor, JobPayload } from "../queue-manager";
import { ReconciliationRepository } from "../../repositories/reconciliation.repository";
import { PaymentRepository } from "../../repositories/payment.repository";
import { NombaPayment } from "../../integrations/nomba/nomba.payment";
import { Logger } from "../../logger/core/logger";

export class SyncTransactionsProcessor implements JobProcessor {
  private readonly reconciliationRepo: ReconciliationRepository;
  private readonly paymentRepo: PaymentRepository;
  private readonly nombaPayment: NombaPayment;
  private readonly logger: Logger;

  constructor() {
    this.reconciliationRepo = new ReconciliationRepository();
    this.paymentRepo = new PaymentRepository();
    this.nombaPayment = new NombaPayment();
    this.logger = new Logger("reconciliation-sync-processor");
  }

  async process(job: Job<JobPayload>): Promise<void> {
    const { from, to, page, limit } = job.data as Record<string, string | number | undefined>;
    this.logger.info("Syncing Nomba transactions", { jobId: job.id, from, to });

    try {
      const providerTxnRefs = await this.nombaPayment.listTransactions({
        from: from ? String(from) : undefined,
        to: to ? String(to) : undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : 50,
      });

      let synced = 0;
      let mismatched = 0;

      for (const txn of providerTxnRefs) {
        const ref = String(txn.reference ?? txn.providerReference ?? "");
        const amount = Number(txn.amount ?? 0);
        const status = String(txn.status ?? "UNKNOWN");

        if (!ref) continue;

        const internal = await this.paymentRepo.findByProviderReference(ref);
        const internalRef = internal?.id ?? null;
        const internalAmount = internal?.amount ?? 0;
        const diff = Math.abs(amount - internalAmount);

        const existing = await this.reconciliationRepo.findByProvider("nomba");
        const alreadyExists = existing.some(r => r.providerReference === ref);

        if (!alreadyExists) {
          const isMatch = internal && status === "SUCCESSFUL" && diff < 0.01;

          await this.reconciliationRepo.create({
            provider: "nomba",
            providerReference: ref,
            internalReference: internalRef ?? undefined,
            amount,
            status: isMatch ? "MATCHED" : "MISMATCHED",
            difference: diff,
          });

          if (isMatch) {
            synced++;
          } else {
            mismatched++;
          }
        }
      }

      this.logger.info("Nomba transactions synced", {
        jobId: job.id,
        total: providerTxnRefs.length,
        synced,
        mismatched,
      });
    } catch (error) {
      this.logger.error("Failed to sync Nomba transactions", {
        jobId: job.id,
        error: String(error),
      });
      throw error;
    }
  }
}

export class MatchTransactionsProcessor implements JobProcessor {
  private readonly reconciliationRepo: ReconciliationRepository;
  private readonly logger: Logger;

  constructor() {
    this.reconciliationRepo = new ReconciliationRepository();
    this.logger = new Logger("reconciliation-match-processor");
  }

  async process(job: Job<JobPayload>): Promise<void> {
    this.logger.info("Matching pending reconciliation records", { jobId: job.id });

    try {
      const pending = await this.reconciliationRepo.findByStatus("PENDING");
      let matched = 0;
      let mismatched = 0;

      for (const record of pending) {
        if (record.internalReference && record.difference < 0.01) {
          await this.reconciliationRepo.updateStatus(record.id, "MATCHED");
          matched++;
        } else if (record.difference >= 0.01) {
          await this.reconciliationRepo.updateStatus(record.id, "MISMATCHED");
          mismatched++;
        }
      }

      this.logger.info("Transaction matching completed", {
        jobId: job.id,
        processed: pending.length,
        matched,
        mismatched,
      });
    } catch (error) {
      this.logger.error("Transaction matching failed", {
        jobId: job.id,
        error: String(error),
      });
      throw error;
    }
  }
}

export class GenerateReconciliationReportProcessor implements JobProcessor {
  private readonly reconciliationRepo: ReconciliationRepository;
  private readonly logger: Logger;

  constructor() {
    this.reconciliationRepo = new ReconciliationRepository();
    this.logger = new Logger("reconciliation-report-processor");
  }

  async process(job: Job<JobPayload>): Promise<void> {
    const { startDate, endDate } = job.data as Record<string, string | undefined>;
    this.logger.info("Generating reconciliation report", { jobId: job.id, startDate, endDate });

    try {
      const records = await this.reconciliationRepo.findAll();

      const totalRecords = records.length;
      const matched = records.filter(r => r.status === "MATCHED").length;
      const mismatched = records.filter(r => r.status === "MISMATCHED").length;
      const pending = records.filter(r => r.status === "PENDING").length;
      const resolved = records.filter(r => r.status === "RESOLVED").length;
      const totalAmount = records.reduce((s, r) => s + r.amount, 0);
      const totalDifference = records.reduce((s, r) => s + r.difference, 0);

      this.logger.info("Reconciliation report generated", {
        jobId: job.id,
        totalRecords,
        matched,
        mismatched,
        pending,
        resolved,
        totalAmount,
        totalDifference,
      });
    } catch (error) {
      this.logger.error("Failed to generate reconciliation report", {
        jobId: job.id,
        error: String(error),
      });
      throw error;
    }
  }
}
