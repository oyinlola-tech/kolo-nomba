import { PrismaDatabase } from "../database/prisma";

export class NombaRepository {
  private get db() {
    return PrismaDatabase.getInstance().getClient();
  }

  async findTransactions(page: number, limit: number, status?: string) {
    const where: Record<string, unknown> = { provider: "nomba" };
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.db.payment.findMany({
        where: where as never,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.db.payment.count({ where: where as never }),
    ]);

    return { data, total };
  }

  async findWebhookEvents(page: number, limit: number, eventStatus?: string) {
    const where: Record<string, unknown> = { provider: "nomba" };
    if (eventStatus) where.status = eventStatus;

    const [data, total] = await Promise.all([
      this.db.webhookEvent.findMany({
        where: where as never,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.db.webhookEvent.count({ where: where as never }),
    ]);

    return { data, total };
  }

  async findFailedPayments(page: number, limit: number) {
    const where = { provider: "nomba", status: "FAILED" as never };
    const [data, total] = await Promise.all([
      this.db.payment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: "desc" },
      }),
      this.db.payment.count({ where }),
    ]);

    return { data, total };
  }

  async findReconciliationResults(page: number, limit: number, status?: string) {
    const where: Record<string, unknown> = { provider: "nomba" };
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.db.reconciliationRecord.findMany({
        where: where as never,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.db.reconciliationRecord.count({ where: where as never }),
    ]);

    return { data, total };
  }
}
