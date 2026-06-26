import { PrismaDatabase } from "../database/prisma";
import type { Prisma } from "../generated/prisma/client";

export class LedgerEntryRepository {
  private get db() {
    return PrismaDatabase.getInstance().getClient();
  }

  private getClient(tx?: Prisma.TransactionClient) {
    return tx ?? this.db;
  }

  async findById(id: string) {
    return this.db.ledgerEntry.findUnique({ where: { id } });
  }

  async findByWallet(walletId: string) {
    return this.db.ledgerEntry.findMany({
      where: { walletId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByTransaction(transactionId: string) {
    return this.db.ledgerEntry.findMany({
      where: { transactionId },
      orderBy: { createdAt: "asc" },
    });
  }

  async create(data: {
    transactionId?: string;
    walletId: string;
    entryType: string;
    amount: number;
    direction: string;
    balanceBefore: number;
    balanceAfter: number;
    description?: string;
  }, tx?: Prisma.TransactionClient) {
    return this.getClient(tx).ledgerEntry.create({ data: data as never });
  }

  async getLastEntry(walletId: string) {
    return this.db.ledgerEntry.findFirst({
      where: { walletId },
      orderBy: { createdAt: "desc" },
    });
  }
}
