import { PrismaDatabase } from "../database/prisma";

export class VirtualAccountRepository {
  private get db() {
    return PrismaDatabase.getInstance().getClient();
  }

  async create(data: {
    provider: string;
    providerReference: string;
    accountNumber: string;
    accountName: string;
    bankName: string;
    ownerType: string;
    ownerId: string;
    status: string;
    metadata?: Record<string, unknown>;
  }) {
    return this.db.virtualAccount.create({
      data: {
        provider: data.provider,
        providerReference: data.providerReference,
        accountNumber: data.accountNumber,
        accountName: data.accountName,
        bankName: data.bankName,
        ownerType: data.ownerType as never,
        ownerId: data.ownerId,
        status: data.status,
        metadata: (data.metadata ?? undefined) as never,
      },
    });
  }

  async findById(id: string) {
    return this.db.virtualAccount.findUnique({ where: { id } });
  }

  async findByProviderReference(providerReference: string) {
    return this.db.virtualAccount.findUnique({ where: { providerReference } });
  }

  async findByAccountNumber(accountNumber: string) {
    return this.db.virtualAccount.findUnique({ where: { accountNumber } });
  }

  async findByOwner(ownerType: string, ownerId: string) {
    return this.db.virtualAccount.findMany({
      where: { ownerType: ownerType as never, ownerId },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.db.virtualAccount.update({
      where: { id },
      data: { status },
    });
  }
}
