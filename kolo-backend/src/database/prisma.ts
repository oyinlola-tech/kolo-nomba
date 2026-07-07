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
    const poolSize = env.PRISMA_POOL_SIZE;
    const adapter = new PrismaPg({
      connectionString: env.DATABASE_URL,
      max: poolSize > 0 ? poolSize : 10,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
    });
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

  async connect(retries = 1, delayMs = 1000): Promise<boolean> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await this.client.$connect();
        this.logger.info("Database connected successfully");
        return true;
      } catch (error) {
        lastError = error;
        if (attempt < retries) {
          this.logger.warn(`Database connection attempt ${attempt}/${retries} failed, retrying...`, {
            error: String(error),
            nextRetryMs: delayMs,
          });
          await new Promise(resolve => setTimeout(resolve, delayMs));
        } else {
          this.logger.warn("Database unavailable at startup", { error: String(lastError) });
          return false;
        }
      }
    }
    return false;
  }

  async disconnect(): Promise<void> {
    await this.client.$disconnect();
    this.logger.info("Database disconnected");
  }
}
