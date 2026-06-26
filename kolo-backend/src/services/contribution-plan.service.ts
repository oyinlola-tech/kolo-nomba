import { ContributionPlanRepository } from "../repositories/contribution-plan.repository";
import { ContributionCycleRepository } from "../repositories/contribution-cycle.repository";
import { MemberContributionRepository } from "../repositories/member-contribution.repository";
import { GroupMemberRepository } from "../repositories/group-member.repository";
import { AuditService } from "./audit.service";
import { AuthError, ForbiddenError } from "../errors/auth.error";
import type { CreateContributionPlanDto, UpdateContributionPlanDto, ContributionPlanResponse, ContributionCycleResponse } from "../dto/contribution.dto";
import { Logger } from "../logger/core/logger";

export class ContributionPlanService {
  private readonly planRepository: ContributionPlanRepository;
  private readonly cycleRepository: ContributionCycleRepository;
  private readonly memberContributionRepository: MemberContributionRepository;
  private readonly groupMemberRepository: GroupMemberRepository;
  private readonly auditService: AuditService;
  private readonly logger: Logger;

  constructor() {
    this.planRepository = new ContributionPlanRepository();
    this.cycleRepository = new ContributionCycleRepository();
    this.memberContributionRepository = new MemberContributionRepository();
    this.groupMemberRepository = new GroupMemberRepository();
    this.auditService = new AuditService();
    this.logger = new Logger("contribution-plan-service");
  }

  async createPlan(dto: CreateContributionPlanDto, groupId: string, userId: string): Promise<ContributionPlanResponse> {
    const plan = await this.planRepository.create({
      groupId,
      name: dto.name,
      description: dto.description ?? null as any,
      amount: dto.amount,
      currency: dto.currency ?? "NGN",
      frequency: dto.frequency,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      createdBy: userId,
    });

    await this.generateCycles(plan.id, plan.startDate, plan.endDate, plan.frequency, plan.amount, groupId);

    await this.auditService.log("CONTRIBUTION_PLAN_CREATED", {
      userId,
      metadata: { planId: plan.id, groupId, name: plan.name },
    });

    this.logger.info("Contribution plan created", { planId: plan.id, groupId });

    return this.mapPlan(plan);
  }

  async getPlans(groupId: string): Promise<ContributionPlanResponse[]> {
    const plans = await this.planRepository.findByGroup(groupId);
    return plans.map(this.mapPlan);
  }

  private async validateGroupAccess(groupId: string, userId: string): Promise<void> {
    const membership = await this.groupMemberRepository.findByGroupAndUser(groupId, userId);
    if (!membership || membership.status !== "ACTIVE") {
      throw new AuthError("You do not have access to this group");
    }
  }

  private async validateGroupAdminAccess(groupId: string, userId: string): Promise<void> {
    const membership = await this.groupMemberRepository.findByGroupAndUser(groupId, userId);
    if (!membership || membership.status !== "ACTIVE") {
      throw new ForbiddenError("You are not a member of this group");
    }
    if (membership.role !== "GROUP_OWNER" && membership.role !== "GROUP_ADMIN") {
      throw new ForbiddenError("Only group admins can modify contribution plans");
    }
  }

  private async getPlanGroupId(planId: string): Promise<string> {
    const plan = await this.planRepository.findById(planId);
    if (!plan) {
      throw new AuthError("Contribution plan not found");
    }
    return plan.groupId;
  }

  async getPlanById(id: string, userId?: string): Promise<ContributionPlanResponse> {
    const plan = await this.planRepository.findById(id);
    if (!plan) {
      throw new AuthError("Contribution plan not found");
    }
    if (userId) {
      await this.validateGroupAccess(plan.groupId, userId);
    }
    return this.mapPlan(plan);
  }

  async updatePlan(id: string, dto: UpdateContributionPlanDto, userId?: string): Promise<ContributionPlanResponse> {
    const groupId = await this.getPlanGroupId(id);
    if (userId) {
      await this.validateGroupAdminAccess(groupId, userId);
    }

    const updated = await this.planRepository.update(id, dto);

    await this.auditService.log("CONTRIBUTION_PLAN_UPDATED", {
      metadata: { planId: id },
    });

    this.logger.info("Contribution plan updated", { planId: id });

    return this.mapPlan(updated);
  }

  async deletePlan(id: string, userId?: string): Promise<void> {
    const groupId = await this.getPlanGroupId(id);
    if (userId) {
      await this.validateGroupAdminAccess(groupId, userId);
    }

    await this.planRepository.updateStatus(id, "COMPLETED");

    await this.auditService.log("CONTRIBUTION_PLAN_COMPLETED", {
      metadata: { planId: id },
    });

    this.logger.info("Contribution plan completed", { planId: id });
  }

  async getCycles(planId: string, userId?: string): Promise<ContributionCycleResponse[]> {
    const groupId = await this.getPlanGroupId(planId);
    if (userId) {
      await this.validateGroupAccess(groupId, userId);
    }

    const cycles = await this.cycleRepository.findByPlan(planId);
    return cycles.map(c => ({
      id: c.id,
      planId: c.planId,
      cycleNumber: c.cycleNumber,
      periodStart: c.periodStart.toISOString(),
      periodEnd: c.periodEnd.toISOString(),
      expectedAmount: c.expectedAmount,
      receivedAmount: c.receivedAmount,
      status: c.status,
      createdAt: c.createdAt.toISOString(),
    }));
  }

  private async generateCycles(
    planId: string,
    startDate: Date,
    endDate: Date,
    frequency: string,
    amount: number,
    groupId: string,
  ): Promise<void> {
    const cycles: Array<{
      planId: string;
      cycleNumber: number;
      periodStart: Date;
      periodEnd: Date;
      expectedAmount: number;
    }> = [];

    const activeMembers = await this.groupMemberRepository.countActiveByGroup(groupId);
    const memberExpectedAmount = amount;
    const cycleExpectedAmount = amount * activeMembers;

    let currentStart = new Date(startDate);
    let cycleNumber = 1;

    while (currentStart < endDate) {
      let currentEnd: Date;

      switch (frequency) {
        case "DAILY":
          currentEnd = new Date(currentStart);
          currentEnd.setDate(currentEnd.getDate() + 1);
          break;
        case "WEEKLY":
          currentEnd = new Date(currentStart);
          currentEnd.setDate(currentEnd.getDate() + 7);
          break;
        case "MONTHLY":
          currentEnd = new Date(currentStart);
          currentEnd.setMonth(currentEnd.getMonth() + 1);
          break;
        default:
          currentEnd = new Date(endDate);
          break;
      }

      if (currentEnd > endDate) {
        currentEnd = new Date(endDate);
      }

      cycles.push({
        planId,
        cycleNumber,
        periodStart: new Date(currentStart),
        periodEnd: new Date(currentEnd),
        expectedAmount: cycleExpectedAmount,
      });

      currentStart = new Date(currentEnd);
      cycleNumber++;
    }

    if (cycles.length > 0) {
      await this.cycleRepository.createMany(cycles);

      const createdCycles = await this.cycleRepository.findByPlan(planId);
      for (const c of createdCycles) {
        await this.generateMemberContributions(c.id, memberExpectedAmount, activeMembers, groupId);
      }
    }

    this.logger.info("Cycles generated", { planId, cycleCount: cycles.length });
  }

  private async generateMemberContributions(
    cycleId: string,
    expectedAmount: number,
    _activeCount: number,
    groupId: string,
  ): Promise<void> {
    const activeMembers = await this.groupMemberRepository.findActiveByGroup(groupId);

    const contributions = activeMembers.map(member => ({
      cycleId,
      groupMemberId: member.id,
      expectedAmount,
    }));

    if (contributions.length > 0) {
      await this.memberContributionRepository.createMany(contributions);
    }

    await this.auditService.log("CYCLE_GENERATED", {
      metadata: { cycleId, memberCount: contributions.length },
    });
  }

  private mapPlan(plan: {
    id: string; groupId: string; name: string; description: string | null;
    amount: number; currency: string; frequency: string; startDate: Date;
    endDate: Date; status: string; createdBy: string; createdAt: Date;
  }): ContributionPlanResponse {
    return {
      id: plan.id,
      groupId: plan.groupId,
      name: plan.name,
      description: plan.description,
      amount: plan.amount,
      currency: plan.currency,
      frequency: plan.frequency,
      startDate: plan.startDate.toISOString(),
      endDate: plan.endDate.toISOString(),
      status: plan.status,
      createdBy: plan.createdBy,
      createdAt: plan.createdAt.toISOString(),
    };
  }
}
