import { ReconciliationRepository } from "../repositories/reconciliation.repository";
import { AuditService } from "./audit.service";
import { AuthError } from "../errors/auth.error";
import type { ReconciliationRecordResponse } from "../dto/reconciliation.dto";
import { Logger } from "../logger/core/logger";

export class ReconciliationService {
  private readonly reconciliationRepository: ReconciliationRepository;
  private readonly auditService: AuditService;
  private readonly logger: Logger;

  constructor() {
    this.reconciliationRepository = new ReconciliationRepository();
    this.auditService = new AuditService();
    this.logger = new Logger("reconciliation-service");
  }

  async getAll(): Promise<ReconciliationRecordResponse[]> {
    const records = await this.reconciliationRepository.findAll();
    return records.map(this.mapRecord);
  }

  async getById(id: string): Promise<ReconciliationRecordResponse> {
    const record = await this.reconciliationRepository.findById(id);
    if (!record) {
      throw new AuthError("Reconciliation record not found");
    }
    return this.mapRecord(record);
  }

  async resolve(id: string, status: string, resolvedBy: string): Promise<ReconciliationRecordResponse> {
    const record = await this.reconciliationRepository.findById(id);
    if (!record) {
      throw new AuthError("Reconciliation record not found");
    }

    await this.reconciliationRepository.updateStatus(id, status, resolvedBy);
    const updated = await this.reconciliationRepository.findById(id);

    await this.auditService.log("RECONCILIATION_RESOLVED", {
      metadata: { recordId: id, status, resolvedBy },
    });

    this.logger.info("Reconciliation resolved", { id, status, resolvedBy });

    return this.mapRecord(updated!);
  }

  private mapRecord(r: {
    id: string; provider: string; providerReference: string;
    internalReference: string | null; amount: number; status: string;
    difference: number; resolvedBy: string | null; resolvedAt: Date | null;
    createdAt: Date;
  }): ReconciliationRecordResponse {
    return {
      id: r.id,
      provider: r.provider,
      providerReference: r.providerReference,
      internalReference: r.internalReference,
      amount: r.amount,
      status: r.status,
      difference: r.difference,
      resolvedBy: r.resolvedBy,
      resolvedAt: r.resolvedAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
    };
  }
}
