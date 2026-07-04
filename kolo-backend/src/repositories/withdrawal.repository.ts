import { PrismaDatabase } from "../database/prisma";

export class WithdrawalRepository {
  private get db() {
    return PrismaDatabase.getInstance().getClient();
  }

  async findById(id: string) {
    return this.db.withdrawalRequest.findUnique({ where: { id } });
  }

  async findByUser(userId: string) {
    return this.db.withdrawalRequest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: {
    userId: string;
    walletId: string;
    amount: number;
    destination?: string;
    destinationBank?: string;
    accountName?: string;
  }) {
    return this.db.withdrawalRequest.create({ data: data as never });
  }

  async updateStatus(id: string, status: string) {
    return this.db.withdrawalRequest.update({
      where: { id },
      data: { status: status as never },
    });
  }
}
