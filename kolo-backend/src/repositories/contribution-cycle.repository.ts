import { PrismaDatabase } from "../database/prisma";

export class ContributionCycleRepository {
  private get db() {
    return PrismaDatabase.getInstance().getClient();
  }

  async findById(id: string) {
    return this.db.contributionCycle.findUnique({ where: { id } });
  }

  async findByPlan(planId: string) {
    return this.db.contributionCycle.findMany({
      where: { planId },
      orderBy: { cycleNumber: "asc" },
    });
  }

  async findActiveByPlan(planId: string) {
    return this.db.contributionCycle.findMany({
      where: { planId, status: { in: ["OPEN", "PROCESSING"] as never } },
      orderBy: { cycleNumber: "asc" },
    });
  }

  async findLatestByPlan(planId: string) {
    return this.db.contributionCycle.findFirst({
      where: { planId },
      orderBy: { cycleNumber: "desc" },
    });
  }

  async create(data: {
    planId: string;
    cycleNumber: number;
    periodStart: Date;
    periodEnd: Date;
    expectedAmount: number;
  }) {
    return this.db.contributionCycle.create({ data });
  }

  async createMany(data: Array<{
    planId: string;
    cycleNumber: number;
    periodStart: Date;
    periodEnd: Date;
    expectedAmount: number;
  }>) {
    return this.db.contributionCycle.createMany({ data: data as never });
  }

  async updateReceivedAmount(id: string, amount: number) {
    return this.db.contributionCycle.update({
      where: { id },
      data: { receivedAmount: { increment: amount } },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.db.contributionCycle.update({ where: { id }, data: { status: status as never } });
  }
}
