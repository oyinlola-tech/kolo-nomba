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
    const env = EnvConfig.getInstance();
    const poolConfig: { connectionString: string; pool?: { max?: number } } = {
      connectionString: env.DATABASE_URL,
    };
    const poolSize = env.PRISMA_POOL_SIZE;
    if (poolSize > 0) {
      poolConfig.pool = { max: poolSize };
    }
    const adapter = new PrismaPg(poolConfig);
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

  async connect(retries = 3, delayMs = 2000): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await this.client.$connect();
        this.logger.info("Database connected successfully");
        return;
      } catch (error) {
        if (attempt < retries) {
          this.logger.warn(`Database connection attempt ${attempt}/${retries} failed, retrying...`, {
            error: String(error),
            nextRetryMs: delayMs,
          });
          await new Promise(resolve => setTimeout(resolve, delayMs));
        } else {
          this.logger.fatal("Failed to connect to database after all retries", { error: String(error) });
          throw error;
        }
      }
    }
  }

  async disconnect(): Promise<void> {
    await this.client.$disconnect();
    this.logger.info("Database disconnected");
  }
}
