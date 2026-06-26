import { PrismaDatabase } from "../database/prisma";
import { RedisClient } from "../database/redis";
import { Logger } from "../logger/core/logger";

export class DatabaseLoader {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("database-loader");
  }

  async load(): Promise<void> {
    await PrismaDatabase.getInstance().connect();
    await RedisClient.getInstance().connect();
    this.logger.info("Database connections established");
  }

  async unload(): Promise<void> {
    await PrismaDatabase.getInstance().disconnect();
    await RedisClient.getInstance().disconnect();
    this.logger.info("Database connections closed");
  }
}
