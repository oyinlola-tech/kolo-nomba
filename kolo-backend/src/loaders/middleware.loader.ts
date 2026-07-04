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

    const explicitOrigins = origins.includes("*") ? ["*"] : origins;
    if (explicitOrigins.length === 0) {
      explicitOrigins.push("http://localhost:5173", "http://localhost:5174");
    }

    this.logger.info("CORS config", { explicitOrigins, nodeEnv: this.config.nodeEnv, frontendUrl: this.config.frontendUrl, isProduction });

    await app.register(cors, {
      origin: (origin: string | undefined) => {
        if (!origin) return true;
        if (explicitOrigins.includes("*")) return true;
        if (explicitOrigins.includes(origin)) return true;
        if (origin.endsWith(".vercel.app")) return true;
        if (origin.endsWith(".telente.site")) return true;
        if (origin === "healthcheck.railway.app") return true;
        if (origin.startsWith("http://localhost")) return true;
        return false;
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Idempotency-Key"],
      maxAge: 86400,
    });
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

    app.addHook("onResponse", (request, reply, done) => {
      const duration = Date.now() - (request.startTime ?? Date.now());
      if (duration > 1000) {
        this.logger.warn("Slow request", {
          method: request.method,
          url: request.url,
          statusCode: reply.statusCode,
          durationMs: duration,
          requestId: request.requestId,
        });
      }
      done();
    });

    app.addHook("onSend", (request, reply, _payload, done) => {
      if (request.url === "/v1/health") {
        reply.header("content-security-policy", undefined);
        reply.header("cross-origin-embedder-policy", undefined);
        reply.header("cross-origin-opener-policy", undefined);
      }
      done();
    });

    app.setErrorHandler(this.errorMiddleware.handle.bind(this.errorMiddleware));

    this.logger.info("Middleware registered", {
      corsOrigins: explicitOrigins,
      nodeEnv: this.config.nodeEnv,
      frontendUrl: this.config.frontendUrl,
      adminFrontendUrl: this.config.adminFrontendUrl,
    });
  }
}
