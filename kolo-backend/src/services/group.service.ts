import { GroupRepository } from "../repositories/group.repository";
import { GroupMemberRepository } from "../repositories/group-member.repository";
import { AuditService } from "./audit.service";
import { AuthError, ForbiddenError } from "../errors/auth.error";
import type { CreateGroupDto, UpdateGroupDto, GroupResponse, GroupDetailResponse, GroupMemberResponse, GroupSettingsResponse, UpdateGroupSettingsDto } from "../dto/group.dto";
import { Logger } from "../logger/core/logger";

export class GroupService {
  private readonly groupRepository: GroupRepository;
  private readonly memberRepository: GroupMemberRepository;
  private readonly auditService: AuditService;
  private readonly logger: Logger;

  constructor() {
    this.groupRepository = new GroupRepository();
    this.memberRepository = new GroupMemberRepository();
    this.auditService = new AuditService();
    this.logger = new Logger("group-service");
  }

  async createGroup(dto: CreateGroupDto, userId: string): Promise<GroupResponse> {
    const group = await this.groupRepository.create({
      ...dto,
      description: dto.description ?? null as any,
      category: dto.category ?? null as any,
      location: dto.location ?? null as any,
      createdBy: userId,
    });

    await this.memberRepository.create({
      groupId: group.id,
      userId,
      role: "GROUP_OWNER",
      status: "ACTIVE",
    });

    await this.auditService.log("GROUP_CREATED", { userId, metadata: { groupId: group.id, groupName: group.name } });

    this.logger.info("Group created", { groupId: group.id, userId });

    return this.mapGroup(group, 1);
  }

  async getGroups(userId: string): Promise<GroupResponse[]> {
    const groups = await this.groupRepository.findByUser(userId);
    return groups.map(g => this.mapGroup(g, g._count.members));
  }

  async getGroupDetails(groupId: string, userId: string): Promise<GroupDetailResponse> {
    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new AuthError("Group not found");
    }

    const membership = group.members.find(m => m.userId === userId);
    if (!membership || membership.status !== "ACTIVE") {
      throw new ForbiddenError("You are not a member of this group");
    }

    const memberResponses: GroupMemberResponse[] = group.members.map(m => ({
      id: m.id,
      userId: m.userId,
      firstName: m.user.firstName,
      lastName: m.user.lastName,
      email: m.user.email,
      role: m.role,
      status: m.status,
      joinedAt: m.joinedAt.toISOString(),
    }));

    return {
      ...this.mapGroup(group, group._count.members),
      members: memberResponses,
    };
  }

  async updateGroup(groupId: string, dto: UpdateGroupDto, userId: string): Promise<GroupResponse> {
    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new AuthError("Group not found");
    }

    await this.verifyAdminAccess(groupId, userId);

    const updated = await this.groupRepository.update(groupId, dto);

    await this.auditService.log("GROUP_UPDATED", { userId, metadata: { groupId } });

    this.logger.info("Group updated", { groupId, userId });

    return this.mapGroup(updated, group._count.members);
  }

  async getGroupMembers(groupId: string, userId: string): Promise<GroupMemberResponse[]> {
    const membership = await this.memberRepository.findByGroupAndUser(groupId, userId);
    if (!membership || membership.status !== "ACTIVE") {
      throw new ForbiddenError("You are not a member of this group");
    }

    const members = await this.memberRepository.findActiveByGroup(groupId);
    return members.map(m => ({
      id: m.id,
      userId: m.userId,
      firstName: m.user.firstName,
      lastName: m.user.lastName,
      email: m.user.email,
      role: m.role,
      status: m.status,
      joinedAt: m.joinedAt.toISOString(),
    }));
  }

  async deleteGroup(groupId: string, userId: string): Promise<void> {
    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new AuthError("Group not found");
    }

    const membership = await this.memberRepository.findByGroupAndUser(groupId, userId);
    if (!membership || membership.role !== "GROUP_OWNER") {
      throw new ForbiddenError("Only the group owner can delete the group");
    }

    await this.groupRepository.softDelete(groupId);

    await this.auditService.log("GROUP_DELETED", { userId, metadata: { groupId } });

    this.logger.info("Group soft-deleted", { groupId, userId });
  }

  async getGroupAnalytics(groupId: string, userId: string) {
    const membership = await this.memberRepository.findByGroupAndUser(groupId, userId);
    if (!membership || membership.status !== "ACTIVE") {
      throw new ForbiddenError("You are not a member of this group");
    }

    const analytics = await this.groupRepository.getAnalytics(groupId);
    if (!analytics) {
      throw new AuthError("Group not found");
    }

    return analytics;
  }

  async getGroupSettings(groupId: string, userId: string): Promise<GroupSettingsResponse> {
    const membership = await this.memberRepository.findByGroupAndUser(groupId, userId);
    if (!membership || membership.status !== "ACTIVE") {
      throw new ForbiddenError("You are not a member of this group");
    }

    const settings = await this.groupRepository.getSettings(groupId);
    if (!settings) {
      throw new AuthError("Group not found");
    }

    return {
      name: settings.name,
      description: settings.description,
      category: settings.category,
      location: settings.location,
      contributionAmount: settings.contributionAmount,
      currency: settings.currency,
      frequency: settings.frequency,
      collectionDay: settings.collectionDay,
    };
  }

  async updateGroupSettings(groupId: string, dto: UpdateGroupSettingsDto, userId: string): Promise<GroupSettingsResponse> {
    const membership = await this.memberRepository.findByGroupAndUser(groupId, userId);
    if (!membership || membership.status !== "ACTIVE") {
      throw new ForbiddenError("You are not a member of this group");
    }
    if (membership.role !== "GROUP_OWNER" && membership.role !== "GROUP_ADMIN") {
      throw new ForbiddenError("Insufficient group permissions");
    }

    const updated = await this.groupRepository.updateSettings(groupId, dto);

    await this.auditService.log("GROUP_SETTINGS_UPDATED", { userId, metadata: { groupId } });
    this.logger.info("Group settings updated", { groupId, userId });

    return {
      name: updated.name,
      description: updated.description,
      category: updated.category,
      location: updated.location,
      contributionAmount: updated.contributionAmount,
      currency: updated.currency,
      frequency: updated.frequency,
      collectionDay: updated.collectionDay,
    };
  }

  private async verifyAdminAccess(groupId: string, userId: string): Promise<void> {
    const membership = await this.memberRepository.findByGroupAndUser(groupId, userId);
    if (!membership || membership.status !== "ACTIVE") {
      throw new ForbiddenError("You are not a member of this group");
    }
    if (membership.role !== "GROUP_OWNER" && membership.role !== "GROUP_ADMIN") {
      throw new ForbiddenError("Insufficient group permissions");
    }
  }

  private mapGroup(group: { id: string; name: string; description: string | null; category: string | null; location: string | null; contributionAmount: number | null; currency: string; frequency: string; collectionDay: number | null; status: string; createdBy: string; createdAt: Date }, memberCount: number): GroupResponse {
    return {
      id: group.id,
      name: group.name,
      description: group.description,
      category: group.category,
      location: group.location,
      contributionAmount: group.contributionAmount,
      currency: group.currency,
      frequency: group.frequency,
      collectionDay: group.collectionDay,
      status: group.status,
      createdBy: group.createdBy,
      memberCount,
      createdAt: group.createdAt.toISOString(),
    };
  }
}
