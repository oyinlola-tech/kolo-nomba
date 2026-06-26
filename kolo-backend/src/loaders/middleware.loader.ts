import type { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { AppConfig } from "../config/app.config";
import { ErrorMiddleware } from "../middleware/error.middleware";
import { RequestContextMiddleware } from "../middleware/request-context.middleware";
import { Logger } from "../logger/core/logger";

export class MiddlewareLoader {
  private readonly logger: Logger;
  private readonly config: AppConfig;
  private readonly errorMiddleware: ErrorMiddleware;
  private readonly requestContext: RequestContextMiddleware;

  constructor() {
    this.logger = new Logger("middleware-loader");
    this.config = new AppConfig();
    this.errorMiddleware = new ErrorMiddleware();
    this.requestContext = new RequestContextMiddleware();
  }

  async load(app: FastifyInstance): Promise<void> {
    const origins = this.config.allowedOrigins;
    const isProduction = this.config.isProduction;
    const corsOptions = isProduction
      ? { origin: this.config.allowedOrigins.filter(o => o !== "*") }
      : origins.includes("*")
        ? { origin: true }
        : { origin: origins };

    await app.register(cors, corsOptions);
    await app.register(helmet);
    await app.register(rateLimit, {
      max: this.config.rateLimitMax,
      timeWindow: "1 minute",
      keyGenerator: (request) => {
        return request.ip;
      },
    });

    app.addHook("onRequest", this.requestContext.handle.bind(this.requestContext));
    app.setErrorHandler(this.errorMiddleware.handle.bind(this.errorMiddleware));

    this.logger.info("Middleware registered", { corsOrigins: isProduction ? "restricted" : origins });
  }
}
