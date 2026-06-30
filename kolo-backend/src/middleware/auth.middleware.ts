import type { FastifyReply, FastifyRequest } from "fastify";
import { AuthError } from "../errors/auth.error";
import { JwtUtil } from "../utils/jwt.util";
import { PrismaDatabase } from "../database/prisma";
import { RedisClient } from "../database/redis";
import { Logger } from "../logger/core/logger";

declare module "fastify" {
  interface FastifyRequest {
    userId?: string;
    userRole?: string;
    accessToken?: string;
  }
}

export class AuthMiddleware {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("auth-middleware");
  }

  private async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const redis = RedisClient.getInstance().getClient();
      if (!redis) {
        this.logger.warn("Redis unavailable for token blacklist check");
        return false;
      }
      const hash = JwtUtil.hashToken(token);
      const result = await redis.get(`blacklist:${hash}`);
      return result !== null;
    } catch (error) {
      this.logger.error("Redis blacklist check failed", { error: String(error) });
      return false;
    }
  }

  async authenticate(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new AuthError("Missing or invalid authorization header");
    }

    const token = authHeader.slice(7);
    try {
      const blacklisted = await this.isTokenBlacklisted(token);
      if (blacklisted) {
        throw new AuthError("Token has been revoked");
      }

      const payload = await JwtUtil.verifyAccessToken(token);
      request.userId = payload.sub;
      request.userRole = payload.role as string;
      request.accessToken = token;

      const db = PrismaDatabase.getInstance().getClient();
      const user = await db.user.findUnique({
        where: { id: payload.sub },
        select: { status: true, lockedUntil: true },
      });

      if (!user) {
        throw new AuthError("User not found");
      }

      if (user.status === "SUSPENDED") {
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new AuthError("Account is temporarily locked. Please try again later.");
        }
        throw new AuthError("Account is suspended. Please contact support.");
      }

      if (user.status !== "ACTIVE") {
        throw new AuthError("Account is not active. Please verify your email.");
      }

      this.logger.debug("Authenticated request", { userId: payload.sub });
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError("Invalid or expired token");
    }
  }
}
