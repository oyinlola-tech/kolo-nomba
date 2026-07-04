import type { FastifyReply, FastifyRequest } from "fastify";
import { ResponseUtil } from "../utils/response.util";
import { AppConfig } from "../config/app.config";

export class HealthController {
  private readonly config: AppConfig;

  constructor() {
    this.config = new AppConfig();
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
    ResponseUtil.success(reply, {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  }
}
