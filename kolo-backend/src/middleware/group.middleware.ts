import type { FastifyReply, FastifyRequest } from "fastify";
import { ForbiddenError } from "../errors/auth.error";
import { AuthError } from "../errors/auth.error";
import { PrismaDatabase } from "../database/prisma";

export class GroupMiddleware {
  async requireGroupAccess(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
    const params = request.params as Record<string, string | undefined>;
    const groupId = params.id ?? params.groupId;
    if (!groupId) {
      throw new AuthError("Group ID is required");
    }

    const userId = request.userId;
    if (!userId) {
      throw new AuthError("Authentication required");
    }

    const db = PrismaDatabase.getInstance().getClient();
    const membership = await db.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });

    if (!membership || membership.status !== "ACTIVE") {
      throw new ForbiddenError("You do not have access to this group");
    }
  }

  async requireGroupAdmin(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
    const params = request.params as Record<string, string | undefined>;
    const groupId = params.id ?? params.groupId;
    if (!groupId) {
      throw new AuthError("Group ID is required");
    }

    const userId = request.userId;
    if (!userId) {
      throw new AuthError("Authentication required");
    }

    const db = PrismaDatabase.getInstance().getClient();
    const membership = await db.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });

    if (!membership || membership.status !== "ACTIVE") {
      throw new ForbiddenError("You are not a member of this group");
    }

    if (membership.role !== "GROUP_OWNER" && membership.role !== "GROUP_ADMIN") {
      throw new ForbiddenError("Insufficient group permissions");
    }
  }

  async requireGroupOwner(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
    const params = request.params as Record<string, string | undefined>;
    const groupId = params.id ?? params.groupId;
    if (!groupId) {
      throw new AuthError("Group ID is required");
    }

    const userId = request.userId;
    if (!userId) {
      throw new AuthError("Authentication required");
    }

    const db = PrismaDatabase.getInstance().getClient();
    const membership = await db.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });

    if (!membership || membership.role !== "GROUP_OWNER") {
      throw new ForbiddenError("Only the group owner can perform this action");
    }
  }
}
