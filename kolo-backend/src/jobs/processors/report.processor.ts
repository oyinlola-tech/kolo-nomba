import type { Job } from "bullmq";
import type { JobProcessor, JobPayload } from "../queue-manager";
import { PrismaDatabase } from "../../database/prisma";
import { Logger } from "../../logger/core/logger";

export class GenerateUserReportProcessor implements JobProcessor {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("report-user-processor");
  }

  async process(job: Job<JobPayload>): Promise<void> {
    const { filters } = job.data;
    this.logger.info("Generating user report", { jobId: job.id, filters });

    const prisma = PrismaDatabase.getInstance().getClient();
    const [totalUsers, activeUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: "ACTIVE" } }),
    ]);

    this.logger.info("User report generated", {
      jobId: job.id,
      totalUsers,
      activeUsers,
    });
  }
}

export class GenerateGroupReportProcessor implements JobProcessor {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("report-group-processor");
  }

  async process(job: Job<JobPayload>): Promise<void> {
    const { groupId, filters } = job.data;
    if (!groupId) {
      throw new Error("Missing groupId");
    }

    this.logger.info("Generating group report", { jobId: job.id, groupId, filters });

    const prisma = PrismaDatabase.getInstance().getClient();
    const group = await prisma.group.findUnique({
      where: { id: String(groupId) },
      include: { _count: { select: { members: { where: { status: "ACTIVE" } } } } },
    });

    if (!group) {
      throw new Error(`Group not found: ${groupId}`);
    }

    const totalContributions = await prisma.memberContribution.aggregate({
      where: { cycle: { plan: { groupId: String(groupId) } } },
      _sum: { paidAmount: true, expectedAmount: true },
    });

    this.logger.info("Group report generated", {
      jobId: job.id,
      groupId,
      groupName: group.name,
      memberCount: group._count.members,
      totalPaid: totalContributions._sum.paidAmount ?? 0,
      totalExpected: totalContributions._sum.expectedAmount ?? 0,
    });
  }
}

export class GenerateTransactionReportProcessor implements JobProcessor {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("report-transaction-processor");
  }

  async process(job: Job<JobPayload>): Promise<void> {
    const { startDate, endDate, filters } = job.data;
    this.logger.info("Generating transaction report", { jobId: job.id, startDate, endDate, filters });

    const prisma = PrismaDatabase.getInstance().getClient();
    const where: Record<string, unknown> = {};
    if (startDate) {
      where.createdAt = { gte: new Date(String(startDate)) };
    }
    if (endDate) {
      where.createdAt = { ...(where.createdAt as Record<string, unknown> ?? {}), lte: new Date(String(endDate)) };
    }

    const [totalTransactions, successfulTransactions, totalAmount] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.count({ where: { ...where, status: "SUCCESSFUL" } }),
      prisma.transaction.aggregate({ where: { ...where, status: "SUCCESSFUL" }, _sum: { amount: true } }),
    ]);

    this.logger.info("Transaction report generated", {
      jobId: job.id,
      totalTransactions,
      successfulTransactions,
      totalAmount: totalAmount._sum.amount ?? 0,
    });
  }
}

export class GenerateRevenueReportProcessor implements JobProcessor {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("report-revenue-processor");
  }

  async process(job: Job<JobPayload>): Promise<void> {
    const { startDate, endDate } = job.data;
    this.logger.info("Generating revenue report", { jobId: job.id, startDate, endDate });

    const prisma = PrismaDatabase.getInstance().getClient();
    const where: Record<string, unknown> = { type: "FEE", status: "SUCCESSFUL" };
    if (startDate) {
      where.createdAt = { gte: new Date(String(startDate)) };
    }
    if (endDate) {
      where.createdAt = { ...(where.createdAt as Record<string, unknown> ?? {}), lte: new Date(String(endDate)) };
    }

    const revenue = await prisma.financialTransaction.aggregate({
      where,
      _sum: { amount: true },
      _count: true,
    });

    this.logger.info("Revenue report generated", {
      jobId: job.id,
      totalRevenue: revenue._sum.amount ?? 0,
      transactionCount: revenue._count,
    });
  }
}
