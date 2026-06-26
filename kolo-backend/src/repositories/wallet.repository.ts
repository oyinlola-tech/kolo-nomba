import { PrismaDatabase } from "../database/prisma";
import type { Prisma } from "../generated/prisma/client";

export class WalletRepository {
  private get db() {
    return PrismaDatabase.getInstance().getClient();
  }

  private getClient(tx?: Prisma.TransactionClient) {
    return tx ?? this.db;
  }

  async findById(id: string, tx?: Prisma.TransactionClient) {
    return this.getClient(tx).wallet.findUnique({ where: { id } });
  }

  async findByOwner(ownerType: string, ownerId: string, tx?: Prisma.TransactionClient) {
    return this.getClient(tx).wallet.findFirst({
      where: { ownerType: ownerType as never, ownerId },
    });
  }

  async create(data: {
    ownerType: string;
    ownerId: string;
    currency: string;
  }, tx?: Prisma.TransactionClient) {
    return this.getClient(tx).wallet.create({ data: data as never });
  }

  async updateBalance(id: string, newBalance: number, tx?: Prisma.TransactionClient) {
    return this.getClient(tx).wallet.update({
      where: { id },
      data: { balance: newBalance },
    });
  }

  async incrementBalance(id: string, amount: number, tx?: Prisma.TransactionClient) {
    return this.getClient(tx).wallet.update({
      where: { id },
      data: { balance: { increment: amount } },
    });
  }

  async decrementBalance(id: string, amount: number, tx?: Prisma.TransactionClient) {
    return this.getClient(tx).wallet.updateMany({
      where: { id, balance: { gte: amount } },
      data: { balance: { decrement: amount } },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.db.wallet.update({
      where: { id },
      data: { status: status as never },
    });
  }
}
