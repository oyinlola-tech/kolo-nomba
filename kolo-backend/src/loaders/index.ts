import type { FastifyInstance } from "fastify";
import { LoggerLoader } from "./logger.loader";
import { DatabaseLoader } from "./database.loader";
import { MiddlewareLoader } from "./middleware.loader";
import { RouteLoader } from "./route.loader";
import { SwaggerLoader } from "./swagger.loader";
import { MigrationLoader } from "./migration.loader";
import { JobLoader } from "../jobs/index";
import { EventLoader } from "./event-loader";
import { ErrorMiddleware } from "../middleware/error.middleware";
import { Logger } from "../logger/core/logger";
import { AppConfig } from "../config/app.config";

export class AppLoader {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("app-loader");
  }

  async loadMinimal(app: FastifyInstance): Promise<void> {
    const config = new AppConfig();
    this.logger.info("Starting minimal application load...");
    this.logger.info("Environment loaded", {
      nodeEnv: config.nodeEnv,
      port: config.port,
      apiPrefix: config.apiPrefix,
      frontendUrl: config.frontendUrl,
      adminFrontendUrl: config.adminFrontendUrl,
    });

    const loggerLoader = new LoggerLoader();
    loggerLoader.load();

    // Routes are synchronous (just define route handlers) — register before listen
    // so they're always available. Middleware uses async plugin registrations that
    // could hang, so those run in background.
    try {
      const routeLoader = new RouteLoader();
      routeLoader.load(app);
    } catch (error) {
      this.logger.warn("Route registration failed", { error: error instanceof Error ? error.message : String(error) });
    }

    // Error handler must be registered before listen so Zod validation errors
    // (400) use our consistent response format instead of Fastify's default.
    try {
      const errorMiddleware = new ErrorMiddleware();
      app.setErrorHandler(errorMiddleware.handle.bind(errorMiddleware));
    } catch (error) {
      this.logger.warn("Error handler setup failed", { error: error instanceof Error ? error.message : String(error) });
    }

    // Fallback CORS — handles both headers and preflight OPTIONS before the
    // real CORS plugin (with origin validation) registers in background.
    const allowedOrigins = config.allowedOrigins;
    const isOriginAllowed = (origin: string): boolean => {
      if (allowedOrigins.includes(origin)) return true;
      if (origin.endsWith(".vercel.app")) return true;
      if (origin.endsWith(".telente.site")) return true;
      if (origin.startsWith("http://localhost")) return true;
      return false;
    };
    app.addHook("onRequest", (request, reply, done) => {
      const origin = request.headers.origin;
      if (origin && isOriginAllowed(origin)) {
        reply.header("Access-Control-Allow-Origin", origin);
        reply.header("Access-Control-Allow-Credentials", "true");
      }
      reply.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
      reply.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
      if (request.method === "OPTIONS") {
        reply.status(204).send();
        return;
      }
      done();
    });

    this.logger.info("Core application loaded — server will start listening immediately");
  }

  async loadRemaining(app: FastifyInstance): Promise<void> {
    this.logger.info("Starting background initialization...");

    try {
      const middlewareLoader = new MiddlewareLoader();
      await middlewareLoader.load(app);
    } catch (error) {
      this.logger.warn("Middleware setup failed", { error: error instanceof Error ? error.message : String(error) });
    }

    try {
      const swaggerLoader = new SwaggerLoader();
      await swaggerLoader.load(app);
    } catch (error) {
      this.logger.warn("Swagger documentation not available", { error: error instanceof Error ? error.message : String(error) });
    }

    try {
      const migrationLoader = new MigrationLoader();
      await migrationLoader.load();
    } catch (error) {
      this.logger.warn("Migration not available", { error: error instanceof Error ? error.message : String(error) });
    }

    try {
      const databaseLoader = new DatabaseLoader();
      await databaseLoader.load();
    } catch (error) {
      this.logger.warn("Database bootstrap unavailable at startup", { error: error instanceof Error ? error.message : String(error) });
    }

    try {
      const jobLoader = new JobLoader();
      await jobLoader.load();
    } catch (error) {
      this.logger.warn("Background jobs not available", { error: error instanceof Error ? error.message : String(error) });
    }

    try {
      const eventLoader = new EventLoader();
      eventLoader.load();
    } catch (error) {
      this.logger.warn("Event handlers not available", { error: error instanceof Error ? error.message : String(error) });
    }

    this.logger.info("Background initialization complete");
  }
}
