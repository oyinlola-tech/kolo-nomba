import { PrismaDatabase } from "../database/prisma";

export class GroupMemberRepository {
  private get db() {
    return PrismaDatabase.getInstance().getClient();
  }

  async findById(id: string) {
    return this.db.groupMember.findUnique({
      where: { id },
      include: { user: true, group: true },
    });
  }

  async findByGroupAndUser(groupId: string, userId: string) {
    return this.db.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
  }

  async findActiveByGroup(groupId: string) {
    return this.db.groupMember.findMany({
      where: { groupId, status: "ACTIVE" },
      include: { user: true },
      orderBy: { joinedAt: "asc" },
    });
  }

  async create(data: {
    groupId: string;
    userId: string;
    role: string;
    status: string;
  }) {
    return this.db.groupMember.create({
      data: data as never,
    });
  }

  async updateRole(id: string, role: string) {
    return this.db.groupMember.update({
      where: { id },
      data: { role: role as never },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.db.groupMember.update({
      where: { id },
      data: { status: status as never },
    });
  }

  async countActiveByGroup(groupId: string) {
    return this.db.groupMember.count({
      where: { groupId, status: "ACTIVE" },
    });
  }
}
