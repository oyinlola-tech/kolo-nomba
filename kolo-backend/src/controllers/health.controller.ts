import type { FastifyReply, FastifyRequest } from "fastify";
import { ResponseUtil } from "../utils/response.util";
import { PrismaDatabase } from "../database/prisma";
import { Logger } from "../logger/core/logger";

export class HealthController {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("health");
  }

  async check(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    let dbStatus = "disconnected";
    try {
      const db = PrismaDatabase.getInstance().getClient();
      await db.$queryRaw`SELECT 1`;
      dbStatus = "connected";
    } catch (error) {
      this.logger.error("Health check DB failure", { error: String(error) });
    }

    ResponseUtil.success(reply, {
      status: dbStatus === "connected" ? "healthy" : "degraded",
      database: dbStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  }
}
