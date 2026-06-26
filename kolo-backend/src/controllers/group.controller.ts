import type { FastifyReply, FastifyRequest } from "fastify";
import { GroupService } from "../services/group.service";
import { GroupInvitationService } from "../services/group-invitation.service";
import { ResponseUtil } from "../utils/response.util";
import { createGroupSchema, updateGroupSchema, inviteMemberSchema, acceptInvitationSchema } from "../validators/group.validator";
import { ValidationError } from "../errors/validation.error";

export class GroupController {
  private readonly groupService: GroupService;
  private readonly invitationService: GroupInvitationService;

  constructor() {
    this.groupService = new GroupService();
    this.invitationService = new GroupInvitationService();
  }

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const parsed = createGroupSchema.safeParse(request.body);
    if (!parsed.success) {
      const details: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!details[key]) details[key] = [];
        details[key].push(issue.message);
      }
      throw new ValidationError("Validation failed", details);
    }

    const result = await this.groupService.createGroup(parsed.data, request.userId!);
    ResponseUtil.created(reply, result);
  }

  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const result = await this.groupService.getGroups(request.userId!);
    ResponseUtil.success(reply, result);
  }

  async getById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const result = await this.groupService.getGroupDetails(id, request.userId!);
    ResponseUtil.success(reply, result);
  }

  async update(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const parsed = updateGroupSchema.safeParse(request.body);
    if (!parsed.success) {
      const details: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!details[key]) details[key] = [];
        details[key].push(issue.message);
      }
      throw new ValidationError("Validation failed", details);
    }

    const result = await this.groupService.updateGroup(id, parsed.data, request.userId!);
    ResponseUtil.success(reply, result);
  }

  async delete(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    await this.groupService.deleteGroup(id, request.userId!);
    ResponseUtil.noContent(reply);
  }

  async inviteMember(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const parsed = inviteMemberSchema.safeParse(request.body);
    if (!parsed.success) {
      const details: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!details[key]) details[key] = [];
        details[key].push(issue.message);
      }
      throw new ValidationError("Validation failed", details);
    }

    const result = await this.invitationService.inviteMember(id, parsed.data, request.userId!);
    ResponseUtil.created(reply, result);
  }

  async acceptInvitation(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const parsed = acceptInvitationSchema.safeParse(request.body);
    if (!parsed.success) {
      const details: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!details[key]) details[key] = [];
        details[key].push(issue.message);
      }
      throw new ValidationError("Validation failed", details);
    }

    await this.invitationService.acceptInvitation(parsed.data.invitationId, request.userId!);
    ResponseUtil.success(reply, { message: "Invitation accepted successfully" });
  }

  async listInvitations(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const result = await this.invitationService.getInvitations(id, request.userId!);
    ResponseUtil.success(reply, result);
  }

  async listMyInvitations(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const result = await this.invitationService.getMyInvitations(request.userId!);
    ResponseUtil.success(reply, result);
  }

  async listMembers(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };
    const result = await this.groupService.getGroupMembers(id, request.userId!);
    ResponseUtil.success(reply, result);
  }

  async removeMember(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id, memberId } = request.params as { id: string; memberId: string };
    await this.invitationService.removeMember(id, memberId, request.userId!);
    ResponseUtil.success(reply, { message: "Member removed successfully" });
  }
}
