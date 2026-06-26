import { PrismaDatabase } from "../database/prisma";

export class ContributionPlanRepository {
  private get db() {
    return PrismaDatabase.getInstance().getClient();
  }

  async findById(id: string) {
    return this.db.contributionPlan.findUnique({ where: { id } });
  }

  async findByGroup(groupId: string) {
    return this.db.contributionPlan.findMany({
      where: { groupId },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: {
    groupId: string;
    name: string;
    description?: string;
    amount: number;
    currency: string;
    frequency: string;
    startDate: Date;
    endDate: Date;
    createdBy: string;
  }) {
    return this.db.contributionPlan.create({ data: data as never });
  }

  async update(id: string, data: {
    name?: string;
    description?: string;
    amount?: number;
    currency?: string;
    frequency?: string;
    status?: string;
  }) {
    return this.db.contributionPlan.update({ where: { id }, data: data as never });
  }

  async updateStatus(id: string, status: string) {
    return this.db.contributionPlan.update({ where: { id }, data: { status: status as never } });
  }
}
