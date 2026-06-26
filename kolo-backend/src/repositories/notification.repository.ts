import { PrismaDatabase } from "../database/prisma";

export class NotificationRepository {
  private get db() {
    return PrismaDatabase.getInstance().getClient();
  }

  async findById(id: string) {
    return this.db.notification.findUnique({ where: { id } });
  }

  async findByUser(userId: string) {
    return this.db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findUnreadByUser(userId: string) {
    return this.db.notification.findMany({
      where: { userId, readAt: null, status: { not: "FAILED" as never } },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    channel: string;
    status?: string;
    metadata?: Record<string, unknown>;
  }) {
    return this.db.notification.create({
      data: {
        userId: data.userId,
        type: data.type as never,
        title: data.title,
        message: data.message,
        channel: data.channel as never,
        status: (data.status ?? "PENDING") as never,
        metadata: (data.metadata ?? undefined) as never,
      },
    });
  }

  async markAsRead(id: string) {
    return this.db.notification.update({
      where: { id },
      data: { status: "READ" as never, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    return this.db.notification.updateMany({
      where: { userId, readAt: null },
      data: { status: "READ" as never, readAt: new Date() },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.db.notification.update({
      where: { id },
      data: { status: status as never },
    });
  }
}
