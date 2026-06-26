import { MemberContributionRepository } from "../repositories/member-contribution.repository";
import { ContributionCycleRepository } from "../repositories/contribution-cycle.repository";
import { ContributionPlanRepository } from "../repositories/contribution-plan.repository";
import { GroupMemberRepository } from "../repositories/group-member.repository";
import { AuthError } from "../errors/auth.error";
import type { MemberContributionResponse } from "../dto/contribution.dto";

export class MemberContributionService {
  private readonly memberContributionRepository: MemberContributionRepository;
  private readonly cycleRepository: ContributionCycleRepository;
  private readonly planRepository: ContributionPlanRepository;
  private readonly groupMemberRepository: GroupMemberRepository;

  constructor() {
    this.memberContributionRepository = new MemberContributionRepository();
    this.cycleRepository = new ContributionCycleRepository();
    this.planRepository = new ContributionPlanRepository();
    this.groupMemberRepository = new GroupMemberRepository();
  }

  private async requireContributionAccess(id: string, userId: string): Promise<void> {
    const contribution = await this.memberContributionRepository.findById(id);
    if (!contribution) {
      throw new AuthError("Contribution not found");
    }
    const cycle = await this.cycleRepository.findById(contribution.cycleId);
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

  async getMyContributions(userId: string): Promise<MemberContributionResponse[]> {
    const contributions = await this.memberContributionRepository.findByUser(userId);
    return contributions.map(c => ({
      id: c.id,
      cycleId: c.cycleId,
      groupMemberId: c.groupMemberId,
      memberName: `${c.groupMember.user.firstName} ${c.groupMember.user.lastName}`,
      expectedAmount: c.expectedAmount,
      paidAmount: c.paidAmount,
      status: c.status,
      paidAt: c.paidAt?.toISOString() ?? null,
    }));
  }

  async getGroupContributions(groupId: string, userId: string): Promise<MemberContributionResponse[]> {
    const contributions = await this.memberContributionRepository.findByUserAndGroup(userId, groupId);
    return contributions.map(c => ({
      id: c.id,
      cycleId: c.cycleId,
      groupMemberId: c.groupMemberId,
      memberName: `${c.groupMember.user.firstName} ${c.groupMember.user.lastName}`,
      expectedAmount: c.expectedAmount,
      paidAmount: c.paidAmount,
      status: c.status,
      paidAt: c.paidAt?.toISOString() ?? null,
    }));
  }

  async getContributionById(id: string, userId?: string): Promise<MemberContributionResponse> {
    if (userId) {
      await this.requireContributionAccess(id, userId);
    }

    const contribution = await this.memberContributionRepository.findById(id);
    if (!contribution) {
      throw new AuthError("Contribution not found");
    }

    return {
      id: contribution.id,
      cycleId: contribution.cycleId,
      groupMemberId: contribution.groupMemberId,
      memberName: `${contribution.groupMember.user.firstName} ${contribution.groupMember.user.lastName}`,
      expectedAmount: contribution.expectedAmount,
      paidAmount: contribution.paidAmount,
      status: contribution.status,
      paidAt: contribution.paidAt?.toISOString() ?? null,
    };
  }
}
