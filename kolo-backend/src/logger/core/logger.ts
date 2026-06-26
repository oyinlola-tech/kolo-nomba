import pino from "pino";
import type { ILogger } from "../../interfaces/logger.interface";
import type { LogMeta } from "./log.types";
import { EnvConfig } from "../../config/env.config";

const SENSITIVE_KEYS = new Set([
  "password", "passwordHash", "token", "accessToken", "refreshToken",
  "secret", "apiKey", "apiSecret", "authorization", "cookie",
  "verificationCode", "otp", "code", "pin", "bankAccount",
]);

function redactMeta(meta: LogMeta): LogMeta {
  const sanitized: LogMeta = {};
  for (const [key, value] of Object.entries(meta)) {
    if (SENSITIVE_KEYS.has(key)) {
      sanitized[key] = "[REDACTED]";
    } else if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      sanitized[key] = redactMeta(value as LogMeta);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

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
    this.logger.info(meta ? redactMeta(meta) : {}, message);
  }

  warn(message: string, meta?: LogMeta): void {
    this.logger.warn(meta ? redactMeta(meta) : {}, message);
  }

  error(message: string, meta?: LogMeta): void {
    this.logger.error(meta ? redactMeta(meta) : {}, message);
  }

  debug(message: string, meta?: LogMeta): void {
    this.logger.debug(meta ? redactMeta(meta) : {}, message);
  }

  fatal(message: string, meta?: LogMeta): void {
    this.logger.fatal(meta ? redactMeta(meta) : {}, message);
  }

  child(context: string): Logger {
    return new Logger(context);
  }
}
