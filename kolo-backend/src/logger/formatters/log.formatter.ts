import type { LogEntry, LogLevel } from "../core/log.types";

export class LogFormatter {
  format(level: LogLevel, message: string, meta?: Record<string, unknown>): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      meta,
    };
  }
}
