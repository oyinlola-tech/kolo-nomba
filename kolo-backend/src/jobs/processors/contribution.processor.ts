import type { Job } from "bullmq";
import type { JobProcessor, JobPayload } from "../queue-manager";
import { ContributionPlanRepository } from "../../repositories/contribution-plan.repository";
import { ContributionCycleRepository } from "../../repositories/contribution-cycle.repository";
import { MemberContributionRepository } from "../../repositories/member-contribution.repository";
import { GroupMemberRepository } from "../../repositories/group-member.repository";
import { NotificationService } from "../../services/notification.service";
import { Logger } from "../../logger/core/logger";
import { addDays, addWeeks, addMonths, isBefore, parseISO } from "date-fns";

export class GenerateCyclesProcessor implements JobProcessor {
  private readonly planRepo: ContributionPlanRepository;
  private readonly cycleRepo: ContributionCycleRepository;
  private readonly memberContributionRepo: MemberContributionRepository;
  private readonly groupMemberRepo: GroupMemberRepository;
  private readonly logger: Logger;

  constructor() {
    this.planRepo = new ContributionPlanRepository();
    this.cycleRepo = new ContributionCycleRepository();
    this.memberContributionRepo = new MemberContributionRepository();
    this.groupMemberRepo = new GroupMemberRepository();
    this.logger = new Logger("contribution-cycle-processor");
  }

  async process(job: Job<JobPayload>): Promise<void> {
    const planId = String(job.data.planId ?? "");
    if (!planId) {
      throw new Error("Missing planId");
    }

    this.logger.info("Generating contribution cycles", { jobId: job.id, planId });

    const plan = await this.planRepo.findById(planId);
    if (!plan) {
      throw new Error(`Contribution plan not found: ${planId}`);
    }

    const activeMembers = await this.groupMemberRepo.findActiveByGroup(plan.groupId);
    if (activeMembers.length === 0) {
      this.logger.warn("No active members for cycle generation", { planId, groupId: plan.groupId });
      return;
    }

    const startDate = plan.startDate instanceof Date ? plan.startDate : parseISO(String(plan.startDate));
    const endDate = plan.endDate instanceof Date ? plan.endDate : parseISO(String(plan.endDate));
    const amount = Number(plan.amount);

    const cycles: Array<{
      planId: string;
      cycleNumber: number;
      periodStart: Date;
      periodEnd: Date;
      expectedAmount: number;
    }> = [];

    let currentDate = new Date(startDate);
    let cycleNumber = 1;

    while (isBefore(currentDate, endDate) || currentDate.getTime() === endDate.getTime()) {
      let periodEnd: Date;
      switch (plan.frequency) {
        case "DAILY":
          periodEnd = addDays(currentDate, 1);
          break;
        case "WEEKLY":
          periodEnd = addWeeks(currentDate, 1);
          break;
        case "MONTHLY":
          periodEnd = addMonths(currentDate, 1);
          break;
        default:
          periodEnd = addWeeks(currentDate, 1);
      }

      if (isBefore(endDate, periodEnd)) {
        periodEnd = new Date(endDate);
      }

      cycles.push({
        planId,
        cycleNumber,
        periodStart: new Date(currentDate),
        periodEnd: new Date(periodEnd),
        expectedAmount: amount,
      });

      cycleNumber++;
      currentDate = new Date(periodEnd);
    }

    if (cycles.length === 0) {
      this.logger.warn("No cycles to generate", { planId });
      return;
    }

    await this.cycleRepo.createMany(cycles);

    const createdCycles = await this.cycleRepo.findByPlan(planId);
    const contributions: Array<{
      cycleId: string;
      groupMemberId: string;
      expectedAmount: number;
    }> = [];

    for (const cycle of createdCycles) {
      for (const member of activeMembers) {
        contributions.push({
          cycleId: cycle.id,
          groupMemberId: member.id,
          expectedAmount: amount,
        });
      }
    }

    if (contributions.length > 0) {
      await this.memberContributionRepo.createMany(contributions);
    }

    await this.planRepo.updateStatus(planId, "ACTIVE");

    this.logger.info("Contribution cycles generated", {
      jobId: job.id,
      planId,
      cyclesCount: cycles.length,
      membersCount: activeMembers.length,
      contributionsCount: contributions.length,
    });
  }
}

export class CheckOverdueProcessor implements JobProcessor {
  private readonly planRepo: ContributionPlanRepository;
  private readonly cycleRepo: ContributionCycleRepository;
  private readonly memberContributionRepo: MemberContributionRepository;
  private readonly logger: Logger;

  constructor() {
    this.planRepo = new ContributionPlanRepository();
    this.cycleRepo = new ContributionCycleRepository();
    this.memberContributionRepo = new MemberContributionRepository();
    this.logger = new Logger("contribution-overdue-processor");
  }

  async process(job: Job<JobPayload>): Promise<void> {
    const groupId = job.data.groupId as string | undefined;

    this.logger.info("Checking overdue contributions", { jobId: job.id, groupId });

    const plans = groupId
      ? await this.planRepo.findByGroup(groupId)
      : [];

    for (const plan of plans) {
      const cycles = await this.cycleRepo.findByPlan(plan.id);
      const now = new Date();

      for (const cycle of cycles) {
        if (cycle.status !== "OPEN") continue;

        if (isBefore(new Date(cycle.periodEnd), now)) {
          const pendingContributions = await this.memberContributionRepo.findPendingByCycle(cycle.id);
          if (pendingContributions.length > 0) {
            const overdueIds = pendingContributions
              .filter(c => c.status === "PENDING")
              .map(c => c.id);

            if (overdueIds.length > 0) {
              await this.memberContributionRepo.updateManyStatus(overdueIds, "LATE");
              this.logger.info("Marked contributions as overdue", {
                planId: plan.id,
                cycleId: cycle.id,
                count: overdueIds.length,
              });
            }
          }

          await this.cycleRepo.updateStatus(cycle.id, "CLOSED");
        }
      }
    }

    this.logger.info("Overdue check completed", { jobId: job.id });
  }
}

export class SendReminderProcessor implements JobProcessor {
  private readonly memberContributionRepo: MemberContributionRepository;
  private readonly notificationService: NotificationService;
  private readonly logger: Logger;

  constructor() {
    this.memberContributionRepo = new MemberContributionRepository();
    this.notificationService = new NotificationService();
    this.logger = new Logger("contribution-reminder-processor");
  }

  async process(job: Job<JobPayload>): Promise<void> {
    const userId = String(job.data.userId ?? "");
    if (!userId) {
      throw new Error("Missing userId");
    }

    this.logger.info("Sending contribution reminder", {
      jobId: job.id,
      userId,
    });

    const contributions = await this.memberContributionRepo.findByUser(userId);
    const pendingContributions = contributions.filter(
      c => c.status === "PENDING" || c.status === "LATE"
    );

    if (pendingContributions.length === 0) {
      this.logger.info("No pending contributions for user", { userId });
      return;
    }

    const overdueCount = pendingContributions.filter(c => c.status === "LATE").length;
    const pendingCount = pendingContributions.filter(c => c.status === "PENDING").length;

    const title = overdueCount > 0
      ? `You have ${overdueCount} overdue contribution${overdueCount > 1 ? "s" : ""}`
      : `You have ${pendingCount} pending contribution${pendingCount > 1 ? "s" : ""}`;

    const message = overdueCount > 0
      ? `Please make your contribution${overdueCount > 1 ? "s" : ""} to avoid penalties.`
      : `Don't forget to complete your pending contribution${pendingCount > 1 ? "s" : ""}.`;

    await this.notificationService.create({
      userId,
      type: "REMINDER",
      title,
      message,
      metadata: {
        pendingCount,
        overdueCount,
        totalAmount: pendingContributions.reduce((sum, c) => sum + (c.expectedAmount - c.paidAmount), 0),
      },
    });

    this.logger.info("Contribution reminder sent", {
      jobId: job.id,
      userId,
      pendingCount,
      overdueCount,
    });
  }
}
