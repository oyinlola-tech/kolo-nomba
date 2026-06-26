import { PrismaDatabase } from "../database/prisma";

export class EmailLogRepository {
  private get db() {
    return PrismaDatabase.getInstance().getClient();
  }

  async create(data: {
    userId?: string;
    template: string;
    recipient: string;
    status: string;
    providerReference?: string;
  }) {
    return this.db.emailLog.create({
      data: {
        userId: data.userId ?? null,
        template: data.template,
        recipient: data.recipient,
        status: data.status,
        providerReference: data.providerReference ?? null,
      },
    });
  }

  async updateStatus(id: string, status: string, providerReference?: string) {
    const data: Record<string, unknown> = { status };
    if (providerReference) data.providerReference = providerReference;
    if (status === "SENT") data.sentAt = new Date();
    return this.db.emailLog.update({ where: { id }, data });
  }
}
