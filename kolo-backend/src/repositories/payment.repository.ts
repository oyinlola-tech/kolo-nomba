import { PrismaDatabase } from "../database/prisma";
import type { Prisma } from "../generated/prisma/client";

export class PaymentRepository {
  private get db() {
    return PrismaDatabase.getInstance().getClient();
  }

  private getClient(tx?: Prisma.TransactionClient) {
    return tx ?? this.db;
  }

  async findById(id: string, tx?: Prisma.TransactionClient) {
    return this.getClient(tx).payment.findUnique({ where: { id } });
  }

  async findByUser(userId: string) {
    return this.db.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByUserPaginated(userId: string, skip: number, take: number) {
    return Promise.all([
      this.db.payment.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      this.db.payment.count({ where: { userId } }),
    ]);
  }

  async findByContribution(contributionId: string, tx?: Prisma.TransactionClient) {
    return this.getClient(tx).payment.findMany({
      where: { contributionId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByTransaction(transactionId: string) {
    return this.db.payment.findMany({
      where: { transactionId },
    });
  }

  async findByProviderReference(reference: string, tx?: Prisma.TransactionClient) {
    return this.getClient(tx).payment.findFirst({
      where: { providerReference: reference },
    });
  }

  async findRecent(take = 50) {
    return this.db.payment.findMany({
      orderBy: { createdAt: "desc" },
      take,
    });
  }

  async create(data: {
    userId: string;
    groupId: string;
    contributionId?: string;
    amount: number;
    currency: string;
    provider: string;
    status: string;
    paymentMethod?: string;
  }, tx?: Prisma.TransactionClient) {
    return this.getClient(tx).payment.create({ data: data as never });
  }

  async updateStatus(id: string, status: string, transactionId?: string, providerReference?: string, tx?: Prisma.TransactionClient) {
    const data: Record<string, unknown> = { status: status as never };
    if (transactionId) data.transactionId = transactionId;
    if (providerReference) data.providerReference = providerReference;
    return this.getClient(tx).payment.update({ where: { id }, data: data as never });
  }
}
