import { PrismaDatabase } from "../database/prisma";

export class PayoutRecipientAccountRepository {
  private get db() {
    return PrismaDatabase.getInstance().getClient();
  }

  async findById(id: string) {
    return this.db.payoutRecipientAccount.findUnique({ where: { id } });
  }

  async findByUser(userId: string) {
    return this.db.payoutRecipientAccount.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: {
    userId: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    provider?: string;
  }) {
    return this.db.payoutRecipientAccount.create({
      data: {
        userId: data.userId,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountName: data.accountName,
        provider: data.provider ?? "nomba",
        verified: false,
      },
    });
  }

  async update(id: string, data: { bankName?: string; accountNumber?: string; accountName?: string }) {
    return this.db.payoutRecipientAccount.update({
      where: { id },
      data,
    });
  }

  async verify(id: string) {
    return this.db.payoutRecipientAccount.update({
      where: { id },
      data: { verified: true },
    });
  }

  async delete(id: string) {
    return this.db.payoutRecipientAccount.delete({ where: { id } });
  }
}
