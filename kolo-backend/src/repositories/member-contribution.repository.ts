import { PrismaDatabase } from "../database/prisma";

export class MemberContributionRepository {
  private get db() {
    return PrismaDatabase.getInstance().getClient();
  }

  async findById(id: string) {
    return this.db.memberContribution.findUnique({
      where: { id },
      include: { cycle: true, groupMember: { include: { user: true } } },
    });
  }

  async findByCycle(cycleId: string) {
    return this.db.memberContribution.findMany({
      where: { cycleId },
      include: { groupMember: { include: { user: true } } },
      orderBy: { createdAt: "asc" },
    });
  }

  async findByGroupMember(groupMemberId: string) {
    return this.db.memberContribution.findMany({
      where: { groupMemberId },
      include: { cycle: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByUserAndGroup(userId: string, groupId: string) {
    return this.db.memberContribution.findMany({
      where: {
        groupMember: { userId, groupId, status: "ACTIVE" },
      },
      include: {
        cycle: true,
        groupMember: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByUser(userId: string) {
    return this.db.memberContribution.findMany({
      where: {
        groupMember: { userId, status: "ACTIVE" },
      },
      include: {
        cycle: { include: { plan: true } },
        groupMember: { include: { user: true, group: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findPendingByCycle(cycleId: string) {
    return this.db.memberContribution.findMany({
      where: { cycleId, status: "PENDING" },
      include: { groupMember: { include: { user: true } } },
    });
  }

  async createMany(data: Array<{
    cycleId: string;
    groupMemberId: string;
    expectedAmount: number;
  }>) {
    return this.db.memberContribution.createMany({ data: data as never });
  }

  async updateStatus(id: string, status: string, paidAmount?: number) {
    const data: Record<string, unknown> = { status: status as never };
    if (paidAmount !== undefined) {
      data.paidAmount = paidAmount;
      if (status === "PAID") {
        data.paidAt = new Date();
      }
    }
    return this.db.memberContribution.update({ where: { id }, data: data as never });
  }

  async updateManyStatus(ids: string[], status: "LATE" | "MISSED") {
    return this.db.memberContribution.updateMany({
      where: { id: { in: ids } },
      data: { status: status as never },
    });
  }

  async getDashboard(cycleId: string) {
    const contributions = await this.db.memberContribution.findMany({
      where: { cycleId },
      select: {
        expectedAmount: true,
        paidAmount: true,
        status: true,
      },
    });

    const totalExpected = contributions.reduce((sum, c) => sum + c.expectedAmount, 0);
    const totalReceived = contributions.reduce((sum, c) => sum + c.paidAmount, 0);
    const paidCount = contributions.filter(c => c.status === "PAID").length;
    const pendingCount = contributions.filter(c => c.status === "PENDING").length;
    const lateCount = contributions.filter(c => c.status === "LATE").length;
    const partialCount = contributions.filter(c => c.status === "PARTIAL").length;

    return {
      totalExpectedAmount: totalExpected,
      totalReceivedAmount: totalReceived,
      outstandingAmount: totalExpected - totalReceived,
      completionPercentage: totalExpected > 0 ? Math.round((totalReceived / totalExpected) * 100) : 0,
      paidCount,
      pendingCount,
      lateCount,
      partialCount,
    };
  }
}
