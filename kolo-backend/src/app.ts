import Fastify, { type FastifyInstance } from "fastify";
import cookie from "@fastify/cookie";
import { AppConfig } from "./config/app.config";
import { AppLoader } from "./loaders/index";
import { Logger } from "./logger/core/logger";
import { PrismaDatabase } from "./database/prisma";
import { RedisClient } from "./database/redis";
import { QueueManager } from "./jobs/queue-manager";
import { SSEManager } from "./services/sse-manager.service";

const SHUTDOWN_TIMEOUT_MS = 10_000;

export class Application {
  private readonly app: FastifyInstance;
  private readonly config: AppConfig;
  private readonly logger: Logger;
  private readonly loader: AppLoader;
  private shuttingDown = false;

  constructor() {
    this.config = new AppConfig();
    this.logger = new Logger("app");
    this.loader = new AppLoader();

    this.app = Fastify({
      logger: false,
      bodyLimit: 1048576,
      trustProxy: true,
      requestTimeout: 30_000,
    });

    this.app.register(cookie, {
      secret: this.config.cookieSecret,
    });
  }

  private async ensurePlatformWallet(): Promise<void> {
    try {
      const db = PrismaDatabase.getInstance().getClient();
      await db.wallet.upsert({
        where: { ownerType_ownerId: { ownerType: "PLATFORM", ownerId: "platform" } },
        create: { ownerType: "PLATFORM", ownerId: "platform", currency: "NGN" },
        update: {},
      });
      this.logger.info("Platform wallet ensured");
    } catch (error) {
      this.logger.warn("Could not ensure platform wallet", { error: String(error) });
    }
  }

  async start(): Promise<void> {
    try {
      await this.loader.load(this.app);
      await this.ensurePlatformWallet();
      await this.app.listen({ port: this.config.port, host: "0.0.0.0" });
      this.logger.info(`Server running on port ${this.config.port}`);

      process.removeAllListeners("SIGTERM");
      process.removeAllListeners("SIGINT");
      process.on("SIGTERM", () => this.shutdown("SIGTERM"));
      process.on("SIGINT", () => this.shutdown("SIGINT"));
    } catch (error: unknown) {
      const err = error as NodeJS.ErrnoException | Error;
      if (err && "code" in err && (err as NodeJS.ErrnoException).code === "EADDRINUSE") {
        this.logger.fatal(`Port ${this.config.port} is already in use`);
      } else {
        this.logger.fatal("Failed to start application", { error: String(error) });
      }
      process.exit(1);
    }
  }

  async shutdown(signal: string): Promise<void> {
    if (this.shuttingDown) return;
    this.shuttingDown = true;

    this.logger.info(`Received ${signal}, shutting down gracefully...`);

    const forceExit = setTimeout(() => {
      this.logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);

    try {
      await this.stop();
    } catch (err) {
      this.logger.error("Error during shutdown", { error: String(err) });
    } finally {
      clearTimeout(forceExit);
      process.exit(0);
    }
  }

  async stop(): Promise<void> {
    this.logger.info("Shutting down...");
    try {
      await QueueManager.getInstance().close();
    } catch (err) {
      this.logger.error("Error closing queue manager", { error: String(err) });
    }
    try {
      await PrismaDatabase.getInstance().disconnect();
    } catch (err) {
      this.logger.error("Error disconnecting database", { error: String(err) });
    }
    try {
      await RedisClient.getInstance().disconnect();
    } catch (err) {
      this.logger.error("Error disconnecting Redis", { error: String(err) });
    }
    SSEManager.getInstance().clear();
    await this.app.close();
    this.logger.info("Server stopped");
  }

  getServer(): FastifyInstance {
    return this.app;
  }
}
