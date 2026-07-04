import { PrismaDatabase } from "../database/prisma";
import { RedisClient } from "../database/redis";
import { Logger } from "../logger/core/logger";

export class DatabaseLoader {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("database-loader");
  }

  async load(): Promise<void> {
    this.logger.info("Connecting to database and cache services");
    const dbConnected = await PrismaDatabase.getInstance().connect();
    const redisConnected = await RedisClient.getInstance().connect();

    if (!dbConnected && !redisConnected) {
      this.logger.warn("Database and Redis are unavailable at startup");
      return;
    }

    if (!dbConnected) {
      this.logger.warn("Database is unavailable at startup");
      return;
    }

    if (redisConnected) {
      this.logger.info("Database connected and cache ready", { dbConnected, redisConnected });
      return;
    }

    this.logger.warn("Redis is unavailable at startup", { dbConnected, redisConnected });
  }

  async unload(): Promise<void> {
    await PrismaDatabase.getInstance().disconnect();
    await RedisClient.getInstance().disconnect();
    this.logger.info("Database connections closed");
  }
}
