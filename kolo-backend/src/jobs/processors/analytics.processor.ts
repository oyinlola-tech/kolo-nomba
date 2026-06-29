import type { Job } from "bullmq";
import type { JobProcessor, JobPayload } from "../queue-manager";
import { PrismaDatabase } from "../../database/prisma";
import { Logger } from "../../logger/core/logger";

export class UpdatePlatformMetricsProcessor implements JobProcessor {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("analytics-metrics-processor");
  }

  async process(job: Job<JobPayload>): Promise<void> {
    this.logger.info("Updating platform metrics", { jobId: job.id });

    const prisma = PrismaDatabase.getInstance().getClient();

    const [
      totalUsers,
      activeUsers,
      totalGroups,
      activeGroups,
      totalContributions,
      successfulPayments,
      pendingPayouts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.group.count(),
      prisma.group.count({ where: { status: "ACTIVE" } }),
      prisma.memberContribution.aggregate({ _sum: { paidAmount: true } }),
      prisma.payment.count({ where: { status: "SUCCESSFUL" } }),
      prisma.payoutRecipient.count({ where: { status: "PENDING" } }),
    ]);

    this.logger.info("Platform metrics updated", {
      jobId: job.id,
      totalUsers,
      activeUsers,
      totalGroups,
      activeGroups,
      totalContributions: totalContributions._sum.paidAmount ?? 0,
      successfulPayments,
      pendingPayouts,
    });
  }
}

export class CalculateDailyStatsProcessor implements JobProcessor {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("analytics-daily-processor");
  }

  async process(job: Job<JobPayload>): Promise<void> {
    this.logger.info("Calculating daily statistics", { jobId: job.id });

    const prisma = PrismaDatabase.getInstance().getClient();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      newUsersToday,
      paymentsToday,
      contributionsToday,
      revenueToday,
    ] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
      prisma.payment.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
      prisma.memberContribution.aggregate({
        where: { paidAt: { gte: today, lt: tomorrow } },
        _sum: { paidAmount: true },
        _count: true,
      }),
      prisma.financialTransaction.aggregate({
        where: { type: "FEE", status: "SUCCESSFUL", createdAt: { gte: today, lt: tomorrow } },
        _sum: { amount: true },
      }),
    ]);

    this.logger.info("Daily statistics calculated", {
      jobId: job.id,
      date: today.toISOString().split("T")[0],
      newUsersToday,
      paymentsToday,
      contributionsAmount: contributionsToday._sum.paidAmount ?? 0,
      contributionsCount: contributionsToday._count,
      revenueToday: revenueToday._sum.amount ?? 0,
    });
  }
}
