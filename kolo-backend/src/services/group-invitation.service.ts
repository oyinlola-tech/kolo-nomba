import { GroupRepository } from "../repositories/group.repository";
import { GroupMemberRepository } from "../repositories/group-member.repository";
import { GroupInvitationRepository } from "../repositories/group-invitation.repository";
import { UserRepository } from "../repositories/user.repository";
import { AuditService } from "./audit.service";
import { AuthError } from "../errors/auth.error";
import { ForbiddenError } from "../errors/auth.error";
import { ValidationError } from "../errors/validation.error";
import { DateUtil } from "../utils/date.util";
import type { InviteMemberDto, InvitationResponse } from "../dto/group.dto";
import { Logger } from "../logger/core/logger";

export class GroupInvitationService {
  private readonly groupRepository: GroupRepository;
  private readonly memberRepository: GroupMemberRepository;
  private readonly invitationRepository: GroupInvitationRepository;
  private readonly userRepository: UserRepository;
  private readonly auditService: AuditService;
  private readonly logger: Logger;

  constructor() {
    this.groupRepository = new GroupRepository();
    this.memberRepository = new GroupMemberRepository();
    this.invitationRepository = new GroupInvitationRepository();
    this.userRepository = new UserRepository();
    this.auditService = new AuditService();
    this.logger = new Logger("group-invitation-service");
  }

  async inviteMember(groupId: string, dto: InviteMemberDto, userId: string): Promise<InvitationResponse> {
    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new AuthError("Group not found");
    }

    const membership = await this.memberRepository.findByGroupAndUser(groupId, userId);
    if (!membership || membership.status !== "ACTIVE") {
      throw new ForbiddenError("You are not a member of this group");
    }
    if (membership.role !== "GROUP_OWNER" && membership.role !== "GROUP_ADMIN") {
      throw new ForbiddenError("Only group admins can invite members");
    }

    if (dto.email) {
      const existingUser = await this.userRepository.findByEmail(dto.email);
      if (existingUser) {
        const existingMember = await this.memberRepository.findByGroupAndUser(groupId, existingUser.id);
        if (existingMember) {
          throw new ValidationError("User is already a member or has a pending invitation");
        }
      }
    }

    if (dto.phone) {
      const existingUser = await this.userRepository.findByPhone(dto.phone);
      if (existingUser) {
        const existingMember = await this.memberRepository.findByGroupAndUser(groupId, existingUser.id);
        if (existingMember) {
          throw new ValidationError("User is already a member or has a pending invitation");
        }
      }
    }

    const expiresAt = DateUtil.addDays(new Date(), 7);

    const invitation = await this.invitationRepository.create({
      groupId,
      email: dto.email ?? null as any,
      phone: dto.phone ?? null as any,
      invitedBy: userId,
      expiresAt,
    });

    await this.auditService.log("MEMBER_INVITED", {
      userId,
      metadata: { groupId, email: dto.email, phone: dto.phone },
    });

    this.logger.info("Member invited", { groupId, invitedBy: userId });

    return {
      id: invitation.id,
      groupId: invitation.groupId,
      groupName: group.name,
      email: invitation.email,
      phone: invitation.phone,
      status: invitation.status,
      expiresAt: invitation.expiresAt.toISOString(),
      createdAt: invitation.createdAt.toISOString(),
    };
  }

  async acceptInvitation(invitationId: string, userId: string): Promise<void> {
    const invitation = await this.invitationRepository.findById(invitationId);
    if (!invitation) {
      throw new AuthError("Invitation not found");
    }

    if (invitation.status !== "PENDING") {
      throw new ValidationError("Invitation is no longer valid");
    }

    if (DateUtil.isExpired(invitation.expiresAt)) {
      await this.invitationRepository.updateStatus(invitationId, "EXPIRED");
      throw new ValidationError("Invitation has expired");
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AuthError("User not found");
    }

    if (invitation.email && invitation.email !== user.email) {
      throw new ForbiddenError("This invitation was not sent to your email");
    }

    if (invitation.phone && invitation.phone !== user.phone) {
      throw new ForbiddenError("This invitation was not sent to your phone");
    }

    const existingMember = await this.memberRepository.findByGroupAndUser(invitation.groupId, userId);
    if (existingMember) {
      throw new ValidationError("You are already a member of this group");
    }

    await this.memberRepository.create({
      groupId: invitation.groupId,
      userId,
      role: "MEMBER",
      status: "ACTIVE",
    });

    await this.invitationRepository.updateStatus(invitationId, "ACCEPTED");

    await this.auditService.log("MEMBER_JOINED", {
      userId,
      metadata: { groupId: invitation.groupId },
    });

    this.logger.info("Member joined group", { groupId: invitation.groupId, userId });
  }

  async getInvitations(groupId: string, userId: string): Promise<InvitationResponse[]> {
    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new AuthError("Group not found");
    }

    const membership = await this.memberRepository.findByGroupAndUser(groupId, userId);
    if (!membership || membership.status !== "ACTIVE") {
      throw new ForbiddenError("You are not a member of this group");
    }

    const invitations = await this.invitationRepository.findPendingByGroup(groupId);

    return invitations.map(inv => ({
      id: inv.id,
      groupId: inv.groupId,
      groupName: group.name,
      email: inv.email,
      phone: inv.phone,
      status: inv.status,
      expiresAt: inv.expiresAt.toISOString(),
      createdAt: inv.createdAt.toISOString(),
    }));
  }

  async getMyInvitations(userId: string): Promise<InvitationResponse[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AuthError("User not found");
    }

    const emailInvitations = await this.invitationRepository.findPendingByEmail(user.email);
    const phoneInvitations = user.phone
      ? await this.invitationRepository.findPendingByPhone(user.phone)
      : [];

    const all = [...emailInvitations, ...phoneInvitations];
    const seen = new Set<string>();
    const unique = all.filter(inv => {
      if (seen.has(inv.id)) return false;
      seen.add(inv.id);
      return true;
    });

    return unique.map(inv => ({
      id: inv.id,
      groupId: inv.groupId,
      groupName: inv.group.name,
      email: inv.email,
      phone: inv.phone,
      status: inv.status,
      expiresAt: inv.expiresAt.toISOString(),
      createdAt: inv.createdAt.toISOString(),
    }));
  }

  async removeMember(groupId: string, memberId: string, userId: string): Promise<void> {
    const member = await this.memberRepository.findById(memberId);
    if (!member || member.groupId !== groupId) {
      throw new AuthError("Member not found in this group");
    }

    const requesterMembership = await this.memberRepository.findByGroupAndUser(groupId, userId);
    if (!requesterMembership || requesterMembership.status !== "ACTIVE") {
      throw new ForbiddenError("You are not a member of this group");
    }
    if (requesterMembership.role !== "GROUP_OWNER" && requesterMembership.role !== "GROUP_ADMIN") {
      throw new ForbiddenError("Only group admins can remove members");
    }

    if (member.role === "GROUP_OWNER") {
      throw new ForbiddenError("Cannot remove the group owner");
    }

    await this.memberRepository.updateStatus(memberId, "REMOVED");

    await this.auditService.log("MEMBER_REMOVED", {
      userId,
      metadata: { groupId, removedUserId: member.userId },
    });

    this.logger.info("Member removed from group", { groupId, removedUserId: member.userId });
  }
}
