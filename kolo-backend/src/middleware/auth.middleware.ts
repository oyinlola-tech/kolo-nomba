import type { FastifyReply, FastifyRequest } from "fastify";
import { AuthError } from "../errors/auth.error";
import { JwtUtil } from "../utils/jwt.util";
import { PrismaDatabase } from "../database/prisma";
import { Logger } from "../logger/core/logger";

declare module "fastify" {
  interface FastifyRequest {
    userId?: string;
    userRole?: string;
  }
}

export class AuthMiddleware {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("auth-middleware");
  }

  async authenticate(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new AuthError("Missing or invalid authorization header");
    }

    const token = authHeader.slice(7);
    try {
      const payload = await JwtUtil.verifyAccessToken(token);
      request.userId = payload.sub;
      request.userRole = payload.role as string;

      const db = PrismaDatabase.getInstance().getClient();
      const user = await db.user.findUnique({
        where: { id: payload.sub },
        select: { status: true },
      });

      if (!user) {
        throw new AuthError("User not found");
      }

      if (user.status !== "ACTIVE") {
        throw new AuthError("Account is not active. Please verify your email.");
      }

      this.logger.debug("Authenticated request", { userId: payload.sub });
    } catch {
      throw new AuthError("Invalid or expired token");
    }
  }
}
