import { PrismaDatabase } from "../database/prisma";

export class ReconciliationRepository {
  private get db() {
    return PrismaDatabase.getInstance().getClient();
  }

  async findById(id: string) {
    return this.db.reconciliationRecord.findUnique({ where: { id } });
  }

  async findAll() {
    return this.db.reconciliationRecord.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async findByProvider(provider: string) {
    return this.db.reconciliationRecord.findMany({
      where: { provider },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByStatus(status: string) {
    return this.db.reconciliationRecord.findMany({
      where: { status: status as never },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: {
    provider: string;
    providerReference: string;
    internalReference?: string;
    amount: number;
    status: string;
    difference: number;
  }) {
    return this.db.reconciliationRecord.create({ data: data as never });
  }

  async updateStatus(id: string, status: string, resolvedBy?: string) {
    const data: Record<string, unknown> = { status: status as never };
    if (resolvedBy) {
      data.resolvedBy = resolvedBy;
      data.resolvedAt = new Date();
    }
    return this.db.reconciliationRecord.update({ where: { id }, data });
  }
}
