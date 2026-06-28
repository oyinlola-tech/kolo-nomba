import { PrismaDatabase } from "../database/prisma";

export class AuditRepository {
  private get db() {
    return PrismaDatabase.getInstance().getClient();
  }

  async create(data: {
    userId?: string;
    action: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
  }) {
    return this.db.auditLog.create({
      data: {
        userId: data.userId ?? null,
        action: data.action,
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
        metadata: (data.metadata ?? undefined) as never,
      },
    });
  }

  async countRecentByUserAndAction(userId: string, action: string, withinMinutes: number): Promise<number> {
    const since = new Date(Date.now() - withinMinutes * 60 * 1000);
    return this.db.auditLog.count({
      where: {
        userId,
        action,
        createdAt: { gte: since },
      },
    });
  }
}
