import Fastify, { type FastifyInstance } from "fastify";
import cookie from "@fastify/cookie";
import { AppConfig } from "./config/app.config";
import { AppLoader } from "./loaders/index";
import { Logger } from "./logger/core/logger";

export class Application {
  private readonly app: FastifyInstance;
  private readonly config: AppConfig;
  private readonly logger: Logger;
  private readonly loader: AppLoader;

  constructor() {
    this.config = new AppConfig();
    this.logger = new Logger("app");
    this.loader = new AppLoader();

    this.app = Fastify({
      logger: false,
      bodyLimit: 1048576,
    });

    this.app.register(cookie, {
      secret: this.config.cookieSecret,
    });
  }

  async start(): Promise<void> {
    try {
      await this.loader.load(this.app);
      await this.app.listen({ port: this.config.port, host: "0.0.0.0" });
      this.logger.info(`Server running on port ${this.config.port}`);
    } catch (error) {
      this.logger.fatal("Failed to start application", { error: String(error) });
      process.exit(1);
    }
  }

  async stop(): Promise<void> {
    await this.app.close();
    this.logger.info("Server stopped");
  }

  getServer(): FastifyInstance {
    return this.app;
  }
}
