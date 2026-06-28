import { PrismaDatabase } from "../database/prisma";

export class PayoutRecipientRepository {
  private get db() {
    return PrismaDatabase.getInstance().getClient();
  }

  async findById(id: string) {
    return this.db.payoutRecipient.findUnique({
      where: { id },
      include: { user: true, payout: true, recipientAccount: true },
    });
  }

  async findByPayout(payoutId: string) {
    return this.db.payoutRecipient.findMany({
      where: { payoutId },
      include: { user: true, recipientAccount: true },
    });
  }

  async findByUser(userId: string) {
    return this.db.payoutRecipient.findMany({
      where: { userId },
      include: { payout: { include: { group: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: {
    payoutId: string;
    userId: string;
    amount: number;
    destinationAccount?: string;
    recipientAccountId?: string;
  }) {
    return this.db.payoutRecipient.create({
      data: {
        payoutId: data.payoutId,
        userId: data.userId,
        amount: data.amount,
        destinationAccount: data.destinationAccount ?? null,
        recipientAccountId: data.recipientAccountId ?? null,
        status: "PENDING" as never,
      },
    });
  }

  async createMany(data: Array<{
    payoutId: string;
    userId: string;
    amount: number;
    destinationAccount?: string;
    recipientAccountId?: string;
  }>) {
    return this.db.payoutRecipient.createMany({
      data: data.map(d => ({
        payoutId: d.payoutId,
        userId: d.userId,
        amount: d.amount,
        destinationAccount: d.destinationAccount ?? null,
        recipientAccountId: d.recipientAccountId ?? null,
        status: "PENDING" as never,
      })),
    });
  }

  async updateStatus(id: string, status: string, providerReference?: string) {
    const data: Record<string, unknown> = { status: status as never };
    if (providerReference) data.providerReference = providerReference;
    if (status === "PROCESSING") data.transferStatus = "PROCESSING";
    if (status === "SUCCESSFUL") {
      data.processedAt = new Date();
      data.transferStatus = "SUCCESSFUL";
    }
    if (status === "FAILED") {
      data.transferStatus = "FAILED";
    }
    return this.db.payoutRecipient.update({ where: { id }, data: data as never });
  }

  async updateTransferDetails(id: string, details: {
    transferReference?: string;
    transferStatus?: string;
    providerReference?: string;
    retryCount?: number;
    failureReason?: string;
    status?: string;
  }) {
    return this.db.payoutRecipient.update({
      where: { id },
      data: details as never,
    });
  }

  async incrementRetry(id: string) {
    return this.db.payoutRecipient.update({
      where: { id },
      data: { retryCount: { increment: 1 } },
    });
  }

  async findFailedByPayout(payoutId: string) {
    return this.db.payoutRecipient.findMany({
      where: { payoutId, status: "FAILED" },
    });
  }
}
