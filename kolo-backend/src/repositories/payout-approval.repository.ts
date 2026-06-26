import { PrismaDatabase } from "../database/prisma";

export class PayoutApprovalRepository {
  private get db() {
    return PrismaDatabase.getInstance().getClient();
  }

  async findByPayout(payoutId: string) {
    return this.db.payoutApproval.findMany({
      where: { payoutId },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: {
    payoutId: string;
    approverId: string;
    decision: string;
    comment?: string;
  }) {
    return this.db.payoutApproval.create({ data: data as never });
  }
}
