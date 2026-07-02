import type { FastifyReply, FastifyRequest } from "fastify";
import { ResponseUtil } from "../utils/response.util";
import { PrismaDatabase } from "../database/prisma";
import { RedisClient } from "../database/redis";
import { AppConfig } from "../config/app.config";
import { Logger } from "../logger/core/logger";

export class HealthController {
  private readonly logger: Logger;
  private readonly config: AppConfig;

  constructor() {
    this.logger = new Logger("health");
    this.config = new AppConfig();
  }

  private withTimeout<T>(promise: Promise<T>, timeoutMs = 5000): Promise<T> {
    let timeoutId: NodeJS.Timeout;
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(`Health check timed out after ${timeoutMs}ms`)), timeoutMs);
      }),
    ]).finally(() => clearTimeout(timeoutId));
  }

  async getConfig(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    ResponseUtil.success(reply, {
      nodeEnv: this.config.nodeEnv,
      frontendUrl: this.config.frontendUrl,
      adminFrontendUrl: this.config.adminFrontendUrl,
      corsOrigin: this.config.corsOrigin,
      allowedOrigins: this.config.allowedOrigins,
      isProduction: this.config.isProduction,
    });
  }

  async check(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    let dbStatus = "disconnected";
    let redisStatus = "disconnected";
    try {
      const db = PrismaDatabase.getInstance().getClient();
      await this.withTimeout(db.$queryRaw`SELECT 1`);
      dbStatus = "connected";
    } catch (error) {
      this.logger.error("Health check DB failure", { error: String(error) });
    }

    try {
      const redis = RedisClient.getInstance();
      if (redis.isConnected()) {
        const client = redis.getClient();
        if (client) {
          await this.withTimeout(client.ping());
          redisStatus = "connected";
        }
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
