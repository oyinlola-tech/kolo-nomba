import { PrismaDatabase } from "../database/prisma";
import type { Prisma } from "../generated/prisma/client";
import { v4 as uuidv4 } from "uuid";

export class FinancialTransactionRepository {
  private get db() {
    return PrismaDatabase.getInstance().getClient();
  }

  private getClient(tx?: Prisma.TransactionClient) {
    return tx ?? this.db;
  }

  async findById(id: string) {
    return this.db.financialTransaction.findUnique({ where: { id } });
  }

  async findByReference(reference: string) {
    return this.db.financialTransaction.findUnique({ where: { reference } });
  }

  async findByUser(userId: string) {
    return this.db.financialTransaction.findMany({
      where: {
        OR: [
          { sourceWalletId: { in: this.db.wallet.findMany({ where: { ownerId: userId }, select: { id: true } }).then(w => w.map(w => w.id)) } as never },
          { destinationWalletId: { in: this.db.wallet.findMany({ where: { ownerId: userId }, select: { id: true } }).then(w => w.map(w => w.id)) } as never },
        ],
      } as never,
      orderBy: { createdAt: "desc" },
    });
  }

  async findByWallet(walletId: string) {
    return this.db.financialTransaction.findMany({
      where: {
        OR: [
          { sourceWalletId: walletId },
          { destinationWalletId: walletId },
        ],
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: {
    reference?: string;
    type: string;
    amount: number;
    currency: string;
    status: string;
    sourceWalletId?: string;
    destinationWalletId?: string;
    metadata?: Record<string, unknown>;
  }, tx?: Prisma.TransactionClient) {
    return this.getClient(tx).financialTransaction.create({
      data: {
        reference: data.reference ?? `FT-${uuidv4().slice(0, 8).toUpperCase()}`,
        type: data.type as never,
        amount: data.amount,
        currency: data.currency,
        status: data.status as never,
        sourceWalletId: data.sourceWalletId ?? null,
        destinationWalletId: data.destinationWalletId ?? null,
        metadata: (data.metadata ?? undefined) as never,
      },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.db.financialTransaction.update({
      where: { id },
      data: { status: status as never },
    });
  }
}
