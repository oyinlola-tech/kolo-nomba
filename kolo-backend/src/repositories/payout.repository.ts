import { PrismaDatabase } from "../database/prisma";

export class PayoutRepository {
  private get db() {
    return PrismaDatabase.getInstance().getClient();
  }

  async findById(id: string) {
    return this.db.payout.findUnique({
      where: { id },
      include: { recipients: { include: { recipientAccount: true } }, approvals: true, schedule: true },
    });
  }

  async findByGroup(groupId: string) {
    return this.db.payout.findMany({
      where: { groupId },
      include: { recipients: { include: { recipientAccount: true } }, schedule: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByUser(userId: string) {
    return this.db.payout.findMany({
      where: {
        OR: [
          { requestedBy: userId },
          { recipients: { some: { userId } } },
        ],
      },
      include: { recipients: true, group: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findPendingByGroup(groupId: string) {
    return this.db.payout.findMany({
      where: { groupId, status: "PENDING" },
      include: { recipients: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findFailedTransfers() {
    return this.db.payoutRecipient.findMany({
      where: { status: "FAILED", retryCount: { lt: 3 } },
      include: { payout: true, user: true, recipientAccount: true },
      orderBy: { updatedAt: "asc" },
    });
  }

  async create(data: {
    groupId: string;
    requestedBy: string;
    amount: number;
    currency: string;
    type?: string;
    scheduleId?: string;
    reason?: string;
  }) {
    return this.db.payout.create({
      data: {
        groupId: data.groupId,
        requestedBy: data.requestedBy,
        amount: data.amount,
        currency: data.currency ?? "NGN",
        type: (data.type ?? "MANUAL") as never,
        scheduleId: data.scheduleId ?? null,
        reason: data.reason ?? null,
        status: "PENDING" as never,
      },
    });
  }

  async updateStatus(id: string, status: string, approvedBy?: string) {
    const data: Record<string, unknown> = { status: status as never };
    if (approvedBy) {
      data.approvedBy = approvedBy;
      data.approvedAt = new Date();
    }
    if (status === "PROCESSING" || status === "COMPLETED") {
      data.processedAt = new Date();
    }
    return this.db.payout.update({ where: { id }, data: data as never });
  }
}
