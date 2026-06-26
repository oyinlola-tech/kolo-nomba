import { PrismaDatabase } from "../database/prisma";

export class NotificationDeliveryRepository {
  private get db() {
    return PrismaDatabase.getInstance().getClient();
  }

  async create(data: {
    notificationId: string;
    channel: string;
    status: string;
    provider?: string;
    providerReference?: string;
    failureReason?: string;
  }) {
    return this.db.notificationDelivery.create({
      data: {
        notificationId: data.notificationId,
        channel: data.channel as never,
        status: data.status as never,
        provider: data.provider ?? null,
        providerReference: data.providerReference ?? null,
        failureReason: data.failureReason ?? null,
      },
    });
  }

  async updateStatus(id: string, status: string, providerReference?: string, failureReason?: string) {
    const updateData: Record<string, unknown> = {
      status: status as never,
      attempts: { increment: 1 },
    };
    if (providerReference) updateData.providerReference = providerReference;
    if (failureReason) updateData.failureReason = failureReason;
    if (status === "SENT") updateData.sentAt = new Date();
    return this.db.notificationDelivery.update({ where: { id }, data: updateData as never });
  }

  async findByNotification(notificationId: string) {
    return this.db.notificationDelivery.findMany({ where: { notificationId } });
  }

  async findPendingRetries(maxAttempts: number) {
    return this.db.notificationDelivery.findMany({
      where: {
        status: "FAILED" as never,
        attempts: { lt: maxAttempts },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async findById(id: string) {
    return this.db.notificationDelivery.findUnique({ where: { id } });
  }
}
