import { Logger } from "../logger/core/logger";

export class RedisClient {
  private static instance: RedisClient;
  private readonly logger: Logger;
  private connected = false;

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
    this.connected = true;
    this.logger.info("Redis connection ready (stub)");
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.logger.info("Redis disconnected (stub)");
  }

  isConnected(): boolean {
    return this.connected;
  }
}
