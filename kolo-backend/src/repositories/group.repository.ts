import { PrismaDatabase } from "../database/prisma";

export class GroupRepository {
  private get db() {
    return PrismaDatabase.getInstance().getClient();
  }

  async findById(id: string) {
    return this.db.group.findUnique({
      where: { id },
      include: {
        members: {
          where: { status: "ACTIVE" },
          include: { user: true },
        },
        _count: { select: { members: { where: { status: "ACTIVE" } } } },
      },
    });
  }

  async findByUser(userId: string) {
    return this.db.group.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        _count: { select: { members: { where: { status: "ACTIVE" } } } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: {
    name: string;
    description?: string;
    category?: string;
    location?: string;
    createdBy: string;
  }) {
    return this.db.group.create({ data });
  }

  async update(id: string, data: {
    name?: string;
    description?: string;
    category?: string;
    location?: string;
    status?: string;
  }) {
    return this.db.group.update({ where: { id }, data: data as never });
  }

  async getSettings(id: string) {
    return this.db.group.findUnique({
      where: { id },
      select: {
        name: true,
        description: true,
        category: true,
        location: true,
        contributionAmount: true,
        currency: true,
        frequency: true,
        collectionDay: true,
      },
    });
  }

  async updateSettings(id: string, data: {
    name?: string;
    description?: string | null;
    category?: string | null;
    location?: string | null;
    contributionAmount?: number | null;
    currency?: string;
    frequency?: string;
    collectionDay?: number | null;
  }) {
    return this.db.group.update({ where: { id }, data: data as never });
  }

  async softDelete(id: string) {
    return this.db.group.update({
      where: { id },
      data: { status: "COMPLETED" as never },
    });
  }

  async getAnalytics(id: string) {
    const group = await this.db.group.findUnique({
      where: { id },
      include: {
        _count: { select: { members: { where: { status: "ACTIVE" } } } },
        contributionPlans: {
          include: {
            cycles: {
              orderBy: { cycleNumber: "asc" },
              include: {
                plan: { select: { amount: true, frequency: true } },
              },
            },
          },
        },
      },
    });

    if (!group) return null;

    const savingsTrend: { month: string; savings: number; contributions: number }[] = [];
    let cumulativeSavings = 0;

    for (const plan of group.contributionPlans) {
      for (const cycle of plan.cycles) {
        cumulativeSavings += cycle.receivedAmount;
        const monthLabel = cycle.periodStart.toLocaleString("en-US", { month: "short", year: "numeric" });
        const existing = savingsTrend.find((s) => s.month === monthLabel);
        if (existing) {
          existing.savings = cumulativeSavings;
          existing.contributions += cycle.receivedAmount;
        } else {
          savingsTrend.push({
            month: monthLabel,
            savings: cumulativeSavings,
            contributions: cycle.receivedAmount,
          });
        }
      }
    }

    const latestCycle = group.contributionPlans
      .flatMap((p) => p.cycles)
      .sort((a, b) => b.cycleNumber - a.cycleNumber)[0];

    return {
      activeUsers: group._count.members,
      activeGroups: 1,
      savingsTrend,
      latestCycle: latestCycle
        ? {
            id: latestCycle.id,
            expectedAmount: latestCycle.expectedAmount,
            receivedAmount: latestCycle.receivedAmount,
            status: latestCycle.status,
          }
        : null,
    };
  }
}
