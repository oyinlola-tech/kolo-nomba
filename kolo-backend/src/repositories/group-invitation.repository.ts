import { PrismaDatabase } from "../database/prisma";

export class GroupInvitationRepository {
  private get db() {
    return PrismaDatabase.getInstance().getClient();
  }

  async findById(id: string) {
    return this.db.groupInvitation.findUnique({
      where: { id },
      include: { group: true },
    });
  }

  async findPendingByEmail(email: string) {
    return this.db.groupInvitation.findMany({
      where: { email, status: "PENDING" },
      include: { group: true },
    });
  }

  async findPendingByPhone(phone: string) {
    return this.db.groupInvitation.findMany({
      where: { phone, status: "PENDING" },
      include: { group: true },
    });
  }

  async findPendingByGroup(groupId: string) {
    return this.db.groupInvitation.findMany({
      where: { groupId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: {
    groupId: string;
    email?: string;
    phone?: string;
    invitedBy: string;
    expiresAt: Date;
  }) {
    return this.db.groupInvitation.create({ data });
  }

  async updateStatus(id: string, status: string) {
    return this.db.groupInvitation.update({
      where: { id },
      data: { status: status as never },
    });
  }

  async expireOverdue(): Promise<number> {
    const result = await this.db.groupInvitation.updateMany({
      where: {
        status: "PENDING",
        expiresAt: { lt: new Date() },
      },
      data: { status: "EXPIRED" as never },
    });
    return result.count;
  }
}
