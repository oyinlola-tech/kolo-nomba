import type { FastifyInstance } from "fastify";
import { LoggerLoader } from "./logger.loader";
import { DatabaseLoader } from "./database.loader";
import { MiddlewareLoader } from "./middleware.loader";
import { RouteLoader } from "./route.loader";
import { SwaggerLoader } from "./swagger.loader";
import { MigrationLoader } from "./migration.loader";
import { JobLoader } from "../jobs/index";
import { EventLoader } from "./event-loader";
import { Logger } from "../logger/core/logger";
import { AppConfig } from "../config/app.config";

export class AppLoader {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("app-loader");
  }

  async load(app: FastifyInstance): Promise<void> {
    const config = new AppConfig();
    this.logger.info("Starting application load...");
    this.logger.info("Environment loaded", {
      nodeEnv: config.nodeEnv,
      port: config.port,
      apiPrefix: config.apiPrefix,
      frontendUrl: config.frontendUrl,
      adminFrontendUrl: config.adminFrontendUrl,
    });

    const loggerLoader = new LoggerLoader();
    loggerLoader.load();

    const migrationLoader = new MigrationLoader();
    migrationLoader.load();

    const middlewareLoader = new MiddlewareLoader();
    await middlewareLoader.load(app);

    const routeLoader = new RouteLoader();
    routeLoader.load(app);

    const swaggerLoader = new SwaggerLoader();
    await swaggerLoader.load(app);

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

    this.logger.info("Application loaded successfully");
  }
}
