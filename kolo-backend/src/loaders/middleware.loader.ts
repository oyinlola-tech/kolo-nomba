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

    if (isProduction && (origins.length === 0 || origins.includes("*"))) {
      throw new Error("CORS_ORIGIN must be explicitly set in production (cannot be '*')");
    }

    const baseOptions = { credentials: true };
    const explicitOrigins = origins.filter(o => o !== "*");
    if (explicitOrigins.length === 0) {
      explicitOrigins.push("http://localhost:5173", "http://localhost:5174");
    }

    app.addHook("onRequest", (request, reply) => {
      if (request.method === "OPTIONS") {
        const origin = request.headers.origin;
        if (origin && explicitOrigins.includes(origin)) {
          reply.header("Access-Control-Allow-Origin", origin);
          reply.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
          reply.header("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Requested-With,Idempotency-Key");
          reply.header("Access-Control-Allow-Credentials", "true");
          reply.header("Access-Control-Max-Age", "86400");
          reply.header("Vary", "Origin");
          reply.status(204).send();
          return;
        }
        if (origin && !explicitOrigins.includes(origin)) {
          this.logger.warn("CORS preflight rejected for unknown origin", { origin, allowedOrigins: explicitOrigins });
          reply.status(204).send();
          return;
        }
      }
    });

    await app.register(cors, { ...baseOptions, origin: explicitOrigins });
    const scriptSrc = isProduction ? ["'self'"] : ["'self'", "'unsafe-inline'"];
    const styleSrc = isProduction ? ["'self'", "https://fonts.googleapis.com"] : ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"];

    await app.register(helmet, {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc,
          styleSrc,
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:"],
          connectSrc: ["'self'", "https://api.nomba.com"],
          frameAncestors: ["'none'"],
          baseUri: ["'self'"],
        },
      },
      crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
      crossOriginEmbedderPolicy: { policy: "require-corp" },
    });
    await app.register(rateLimit, {
      max: this.config.rateLimitMax,
      timeWindow: "1 minute",
      keyGenerator: (request) => {
        return request.ip;
      },
    });

    app.addHook("onRequest", this.requestContext.handle.bind(this.requestContext));
    app.setErrorHandler(this.errorMiddleware.handle.bind(this.errorMiddleware));

    this.logger.info("Middleware registered", { corsOrigins: origins });
  }
}
