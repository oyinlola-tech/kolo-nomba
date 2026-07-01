import type { FastifyInstance } from "fastify";
import { LoggerLoader } from "./logger.loader";
import { DatabaseLoader } from "./database.loader";
import { MiddlewareLoader } from "./middleware.loader";
import { RouteLoader } from "./route.loader";
import { SwaggerLoader } from "./swagger.loader";
import { MigrationLoader } from "./migration.loader";
import { JobLoader } from "../jobs/index";
import { Logger } from "../logger/core/logger";

export class AppLoader {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("app-loader");
  }

  async load(app: FastifyInstance): Promise<void> {
    this.logger.info("Starting application load...");

    const loggerLoader = new LoggerLoader();
    loggerLoader.load();

    const migrationLoader = new MigrationLoader();
    migrationLoader.load();

    const databaseLoader = new DatabaseLoader();
    await databaseLoader.load();

    const middlewareLoader = new MiddlewareLoader();
    await middlewareLoader.load(app);

    const swaggerLoader = new SwaggerLoader();
    await swaggerLoader.load(app);

    const routeLoader = new RouteLoader();
    routeLoader.load(app);

    try {
      const jobLoader = new JobLoader();
      await jobLoader.load();
    } catch (error) {
      this.logger.warn("Background jobs not available", { error: error instanceof Error ? error.message : String(error) });
    }

    this.logger.info("Application loaded successfully");
  }
}
