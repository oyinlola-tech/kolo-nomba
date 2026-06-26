import { PrismaDatabase } from "../database/prisma";
import { v4 as uuidv4 } from "uuid";

export class TransactionRepository {
  private get db() {
    return PrismaDatabase.getInstance().getClient();
  }

  async findById(id: string) {
    return this.db.transaction.findUnique({ where: { id } });
  }

  async findByReference(reference: string) {
    return this.db.transaction.findUnique({ where: { reference } });
  }

  async findByUser(userId: string) {
    return this.db.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: {
    userId: string;
    amount: number;
    currency: string;
    type: string;
    status: string;
    reference?: string;
    metadata?: Record<string, unknown>;
  }) {
    return this.db.transaction.create({
      data: {
        reference: data.reference ?? `TXN-${uuidv4().slice(0, 8).toUpperCase()}`,
        userId: data.userId,
        amount: data.amount,
        currency: data.currency ?? "NGN",
        type: data.type as never,
        status: data.status as never,
        metadata: (data.metadata ?? undefined) as never,
      },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.db.transaction.update({
      where: { id },
      data: { status: status as never },
    });
  }
}
