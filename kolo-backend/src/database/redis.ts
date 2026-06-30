import IORedis from "ioredis";
import { EnvConfig } from "../config/env.config";
import { Logger } from "../logger/core/logger";

export class RedisClient {
  private static instance: RedisClient;
  private readonly logger: Logger;
  private client: IORedis | null = null;

  private constructor() {
    this.logger = new Logger("redis");
  }

  static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  async connect(): Promise<void> {
    const env = EnvConfig.getInstance();
    if (!env.REDIS_URL && !env.REDIS_HOST) {
      this.logger.warn("Redis not configured — running without Redis");
      return;
    }
    try {
      if (env.REDIS_URL) {
        this.client = new IORedis(env.REDIS_URL, {
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
          lazyConnect: true,
          retryStrategy: (times: number) => Math.min(times * 100, 3000),
        });
      } else {
        const redisOpts: Record<string, unknown> = {
          host: env.REDIS_HOST,
          port: env.REDIS_PORT,
          db: env.REDIS_DB,
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
          lazyConnect: true,
          retryStrategy: (times: number) => Math.min(times * 100, 3000),
        };
        if (env.REDIS_PASSWORD) {
          redisOpts.password = env.REDIS_PASSWORD;
        }
        this.client = new IORedis(redisOpts);
      }
      this.client.on("error", (err: Error) => {
        this.logger.error("Redis connection error", { error: String(err) });
      });
      await this.client.connect();
      this.logger.info("Redis connected", { host: env.REDIS_URL || env.REDIS_HOST });
    } catch (error) {
      this.logger.error("Failed to connect to Redis", { error: String(error) });
      this.client = null;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
    this.logger.info("Redis disconnected");
  }

  getClient(): IORedis | null {
    return this.client;
  }

  isConnected(): boolean {
    return this.client?.status === "ready";
  }
}
