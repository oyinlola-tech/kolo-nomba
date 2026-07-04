import type { FastifyInstance } from "fastify";
import { RouteRegistry } from "../routes/index";
import { Logger } from "../logger/core/logger";

export class RouteLoader {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("route-loader");
  }

  load(app: FastifyInstance): void {
    this.logger.info("Registering routes");
    const registry = new RouteRegistry(app);
    registry.register();
    this.logger.info("Routes registered");
  }
}
