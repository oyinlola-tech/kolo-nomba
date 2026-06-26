import { PrismaDatabase } from "../database/prisma";
import type { DashboardMetrics, ChartDataPoint } from "../dto/admin.dto";

export class AdminRepository {
  private get db() {
    return PrismaDatabase.getInstance().getClient();
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const [userCounts, groupCounts, txnAgg] = await Promise.all([
      this.db.user.aggregate({
        _count: { id: true },
        where: { status: "ACTIVE" as never },
      }),
      this.db.group.aggregate({
        _count: { id: true },
        where: { status: "ACTIVE" as never },
      }),
      this.db.financialTransaction.aggregate({
        _count: { id: true },
        _sum: { amount: true },
      }),
    ]);

    const totalUsers = await this.db.user.count();
    const totalGroups = await this.db.group.count();

    return {
      totalUsers,
      activeUsers: userCounts._count.id,
      totalGroups,
      activeGroups: groupCounts._count.id,
      totalTransactions: txnAgg._count.id,
      totalMoneyProcessed: txnAgg._sum.amount ?? 0,
      totalRevenue: txnAgg._sum.amount ?? 0,
    };
  }

  async getMonthlyRevenue(months = 12): Promise<ChartDataPoint[]> {
    const data: ChartDataPoint[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const result = await this.db.financialTransaction.aggregate({
        _sum: { amount: true },
        where: {
          type: "FEE" as never,
          status: "SUCCESSFUL" as never,
          createdAt: { gte: start, lt: end },
        },
      });

      data.push({
        date: start.toISOString().slice(0, 7),
        value: result._sum.amount ?? 0,
      });
    }

    return data;
  }

  async getTransactionVolumeByDay(days = 30): Promise<ChartDataPoint[]> {
    const data: ChartDataPoint[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(start.getDate() - i);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      const result = await this.db.financialTransaction.aggregate({
        _sum: { amount: true },
        where: {
          status: "SUCCESSFUL" as never,
          createdAt: { gte: start, lt: end },
        },
      });

      data.push({
        date: start.toISOString().slice(0, 10),
        value: result._sum.amount ?? 0,
      });
    }

    return data;
  }

  async getUserGrowthByDay(days = 30): Promise<ChartDataPoint[]> {
    const data: ChartDataPoint[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(start.getDate() - i);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      const count = await this.db.user.count({
        where: { createdAt: { gte: start, lt: end } },
      });

      data.push({
        date: start.toISOString().slice(0, 10),
        value: count,
      });
    }

    return data;
  }

  async getGroupCreationByDay(days = 30): Promise<ChartDataPoint[]> {
    const data: ChartDataPoint[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(start.getDate() - i);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      const count = await this.db.group.count({
        where: { createdAt: { gte: start, lt: end } },
      });

      data.push({
        date: start.toISOString().slice(0, 10),
        value: count,
      });
    }

    return data;
  }

  async getUsers(page: number, limit: number, search?: string) {
    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.db.user.findMany({
        where: where as never,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.db.user.count({ where: where as never }),
    ]);

    return { data, total };
  }

  async getGroups(page: number, limit: number, search?: string) {
    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { category: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.db.group.findMany({
        where: where as never,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: { select: { members: { where: { status: "ACTIVE" as never } } } },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.db.group.count({ where: where as never }),
    ]);

    return { data, total };
  }

  async getTransactions(page: number, limit: number, filters?: {
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    userId?: string;
  }) {
    const where: Record<string, unknown> = {};

    if (filters?.type) where.type = filters.type as never;
    if (filters?.status) where.status = filters.status as never;
    if (filters?.userId) where.userId = filters.userId;

    if (filters?.startDate || filters?.endDate) {
      const createdAt: Record<string, Date> = {};
      if (filters?.startDate) createdAt.gte = new Date(filters.startDate);
      if (filters?.endDate) createdAt.lt = new Date(filters.endDate);
      where.createdAt = createdAt;
    }

    const [data, total] = await Promise.all([
      this.db.financialTransaction.findMany({
        where: where as never,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.db.financialTransaction.count({ where: where as never }),
    ]);

    return { data, total };
  }

  async getWithdrawals(page: number, limit: number) {
    const [data, total] = await Promise.all([
      this.db.withdrawalRequest.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.db.withdrawalRequest.count(),
    ]);

    return { data, total };
  }

  async getAuditLogs(page: number, limit: number) {
    const [data, total] = await Promise.all([
      this.db.auditLog.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.db.auditLog.count(),
    ]);

    return { data, total };
  }

  async getSecurityEvents(page: number, limit: number) {
    const where = {
      OR: [
        { action: { contains: "LOGIN_FAILED" } },
        { action: { contains: "SECURITY" } },
        { action: { contains: "SUSPICIOUS" } },
        { action: { contains: "UNAUTHORIZED" } },
      ],
    };

    const [data, total] = await Promise.all([
      this.db.auditLog.findMany({
        where: where as never,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.db.auditLog.count({ where: where as never }),
    ]);

    return { data, total };
  }

  async getRevenueBySource(): Promise<Array<{ source: string; amount: number }>> {
    const fees = await this.db.financialTransaction.aggregate({
      _sum: { amount: true },
      where: { type: "FEE" as never, status: "SUCCESSFUL" as never },
    });

    const contributions = await this.db.financialTransaction.aggregate({
      _sum: { amount: true },
      where: { type: "CONTRIBUTION" as never, status: "SUCCESSFUL" as never },
    });

    return [
      { source: "Fees", amount: fees._sum.amount ?? 0 },
      { source: "Contributions", amount: contributions._sum.amount ?? 0 },
    ];
  }

  async getRecentActivities(limit = 10) {
    const [recentUsers, recentTransactions, recentPayouts] = await Promise.all([
      this.db.user.findMany({ orderBy: { createdAt: "desc" }, take: limit }),
      this.db.financialTransaction.findMany({
        where: { status: "SUCCESSFUL" as never },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      this.db.payout.findMany({ orderBy: { createdAt: "desc" }, take: limit }),
    ]);

    return {
      recentRegistrations: recentUsers.map(u => ({ id: u.id, name: `${u.firstName} ${u.lastName}`, createdAt: u.createdAt })),
      recentTransactions: recentTransactions.map(t => ({ id: t.id, reference: t.reference, amount: t.amount, createdAt: t.createdAt })),
      recentPayouts: recentPayouts.map(p => ({ id: p.id, amount: p.amount, status: p.status, createdAt: p.createdAt })),
    };
  }
}
