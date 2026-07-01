import type { FastifyReply, FastifyRequest } from "fastify";
import { ResponseUtil } from "../utils/response.util";
import { PrismaDatabase } from "../database/prisma";
import { RedisClient } from "../database/redis";
import { Logger } from "../logger/core/logger";

export class HealthController {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("health");
  }

  async check(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    let dbStatus = "disconnected";
    let redisStatus = "disconnected";
    try {
      const db = PrismaDatabase.getInstance().getClient();
      await db.$queryRaw`SELECT 1`;
      dbStatus = "connected";
    } catch (error) {
      this.logger.error("Health check DB failure", { error: String(error) });
    }

    try {
      const redis = RedisClient.getInstance();
      if (redis.isConnected()) {
        await redis.getClient()?.ping();
        redisStatus = "connected";
      }
    } catch (error) {
      this.logger.error("Health check Redis failure", { error: String(error) });
    }

    const isHealthy = dbStatus === "connected" && redisStatus === "connected";

    if (!isHealthy) {
      reply.status(503).send({
        success: false,
        status: "unhealthy",
        database: dbStatus,
        redis: redisStatus,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
      return;
    }

    ResponseUtil.success(reply, {
      status: "healthy",
      database: dbStatus,
      redis: redisStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  }
}
