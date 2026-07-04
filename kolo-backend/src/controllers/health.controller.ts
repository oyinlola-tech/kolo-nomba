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

  private withTimeout<T>(promise: Promise<T>, timeoutMs = 2000): Promise<T> {
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

  async check(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    this.logger.info("Health check received", { url: request.url, ip: request.ip, id: request.id });

    let dbStatus = "disconnected";
    let redisStatus = "unavailable";

    try {
      const db = PrismaDatabase.getInstance().getClient();
      await this.withTimeout(db.$queryRaw`SELECT 1`, 2000);
      dbStatus = "connected";
    } catch {
      this.logger.warn("Health check DB unavailable");
    }

    try {
      const redis = RedisClient.getInstance();
      if (redis.isConnected()) {
        const client = redis.getClient();
        if (client) {
          await this.withTimeout(client.ping(), 2000);
          redisStatus = "connected";
        }
      }
    } catch {
      this.logger.warn("Health check Redis unavailable");
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
