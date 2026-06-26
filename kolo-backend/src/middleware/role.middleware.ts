import type { FastifyReply, FastifyRequest } from "fastify";
import { ForbiddenError } from "../errors/auth.error";
import type { Role } from "../constants/roles.constant";

export class RoleMiddleware {
  private readonly allowedRoles: Role[];

  constructor(...allowedRoles: Role[]) {
    this.allowedRoles = allowedRoles;
  }

  authorize(request: FastifyRequest, _reply: FastifyReply): void {
    if (!request.userRole) {
      throw new ForbiddenError("No role assigned");
    }

    if (!this.allowedRoles.includes(request.userRole as Role)) {
      throw new ForbiddenError("Insufficient permissions");
    }
  }
}
