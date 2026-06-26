import { AuditRepository } from "../repositories/audit.repository";
import { AuditLogger } from "../logger/implementations/audit.logger";

export class AuditService {
  private readonly repository: AuditRepository;
  private readonly logger: AuditLogger;

  constructor() {
    this.repository = new AuditRepository();
    this.logger = new AuditLogger();
  }

  async log(action: string, options?: {
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    await this.repository.create({
      userId: options?.userId,
      action,
      ipAddress: options?.ipAddress,
      userAgent: options?.userAgent,
      metadata: options?.metadata,
    });

    this.logger.log(action, options?.userId ?? "", options?.metadata);
  }
}
