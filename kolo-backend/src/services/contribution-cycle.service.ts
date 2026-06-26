import { ContributionCycleRepository } from "../repositories/contribution-cycle.repository";
import { ContributionPlanRepository } from "../repositories/contribution-plan.repository";
import { GroupMemberRepository } from "../repositories/group-member.repository";
import { MemberContributionRepository } from "../repositories/member-contribution.repository";
import { AuthError } from "../errors/auth.error";
import type { ContributionCycleResponse, ContributionDashboardResponse } from "../dto/contribution.dto";

export class ContributionCycleService {
  private readonly cycleRepository: ContributionCycleRepository;
  private readonly planRepository: ContributionPlanRepository;
  private readonly groupMemberRepository: GroupMemberRepository;
  private readonly memberContributionRepository: MemberContributionRepository;

  constructor() {
    this.cycleRepository = new ContributionCycleRepository();
    this.planRepository = new ContributionPlanRepository();
    this.groupMemberRepository = new GroupMemberRepository();
    this.memberContributionRepository = new MemberContributionRepository();
  }

  private async requireCycleAccess(cycleId: string, userId: string): Promise<void> {
    const cycle = await this.cycleRepository.findById(cycleId);
    if (!cycle) {
      throw new AuthError("Contribution cycle not found");
    }
    const plan = await this.planRepository.findById(cycle.planId);
    if (!plan) {
      throw new AuthError("Contribution plan not found");
    }
    const membership = await this.groupMemberRepository.findByGroupAndUser(plan.groupId, userId);
    if (!membership || membership.status !== "ACTIVE") {
      throw new AuthError("You do not have access to this group");
    }
  }

  async getCycleById(id: string, userId?: string): Promise<ContributionCycleResponse> {
    if (userId) {
      await this.requireCycleAccess(id, userId);
    } else {
      const cycle = await this.cycleRepository.findById(id);
      if (!cycle) {
        throw new AuthError("Contribution cycle not found");
      }
    }

    const cycle = await this.cycleRepository.findById(id);
    if (!cycle) {
      throw new AuthError("Contribution cycle not found");
    }

    return {
      id: cycle.id,
      planId: cycle.planId,
      cycleNumber: cycle.cycleNumber,
      periodStart: cycle.periodStart.toISOString(),
      periodEnd: cycle.periodEnd.toISOString(),
      expectedAmount: cycle.expectedAmount,
      receivedAmount: cycle.receivedAmount,
      status: cycle.status,
      createdAt: cycle.createdAt.toISOString(),
    };
  }

  async getDashboard(cycleId: string, userId?: string): Promise<ContributionDashboardResponse> {
    if (userId) {
      await this.requireCycleAccess(cycleId, userId);
    } else {
      const cycle = await this.cycleRepository.findById(cycleId);
      if (!cycle) {
        throw new AuthError("Contribution cycle not found");
      }
    }

    return this.memberContributionRepository.getDashboard(cycleId);
  }
}
