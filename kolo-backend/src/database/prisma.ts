import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { EnvConfig } from "../config/env.config";
import { Logger } from "../logger/core/logger";

export class PrismaDatabase {
  private static instance: PrismaDatabase;
  private readonly client: PrismaClient;
  private readonly logger: Logger;

  private constructor() {
    this.logger = new Logger("database");
    const adapter = new PrismaPg({ connectionString: EnvConfig.getInstance().DATABASE_URL });
    this.client = new PrismaClient({ adapter });
  }

  static getInstance(): PrismaDatabase {
    if (!PrismaDatabase.instance) {
      PrismaDatabase.instance = new PrismaDatabase();
    }
    return PrismaDatabase.instance;
  }

  getClient(): PrismaClient {
    return this.client;
  }

  async connect(): Promise<void> {
    try {
      await this.client.$connect();
      this.logger.info("Database connected successfully");
    } catch (error) {
      this.logger.fatal("Failed to connect to database", { error: String(error) });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.client.$disconnect();
    this.logger.info("Database disconnected");
  }
}
