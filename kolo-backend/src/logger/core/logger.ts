import pino from "pino";
import type { ILogger } from "../../interfaces/logger.interface";
import type { LogMeta } from "./log.types";
import { EnvConfig } from "../../config/env.config";

export class Logger implements ILogger {
  private readonly logger: pino.Logger;

  constructor(context?: string) {
    const env = EnvConfig.getInstance();
    const transport = env.isDevelopment
      ? { target: "pino-pretty", options: { colorize: true, translateTime: "SYS:standard" } }
      : undefined;

    this.logger = pino({
      level: env.LOG_LEVEL,
      name: context ?? "kolo",
      transport,
    });
  }

  info(message: string, meta?: LogMeta): void {
    this.logger.info(meta ?? {}, message);
  }

  warn(message: string, meta?: LogMeta): void {
    this.logger.warn(meta ?? {}, message);
  }

  error(message: string, meta?: LogMeta): void {
    this.logger.error(meta ?? {}, message);
  }

  debug(message: string, meta?: LogMeta): void {
    this.logger.debug(meta ?? {}, message);
  }

  fatal(message: string, meta?: LogMeta): void {
    this.logger.fatal(meta ?? {}, message);
  }

  child(context: string): Logger {
    return new Logger(context);
  }
}
