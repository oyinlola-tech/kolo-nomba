import { PrismaDatabase } from "../database/prisma";

export class NotificationPreferenceRepository {
  private get db() {
    return PrismaDatabase.getInstance().getClient();
  }

  async findByUser(userId: string) {
    return this.db.notificationPreference.findUnique({ where: { userId } });
  }

  async upsert(userId: string, data: {
    emailEnabled?: boolean;
    smsEnabled?: boolean;
    pushEnabled?: boolean;
    whatsappEnabled?: boolean;
    securityAlerts?: boolean;
    paymentAlerts?: boolean;
    marketingMessages?: boolean;
  }) {
    return this.db.notificationPreference.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }
}
