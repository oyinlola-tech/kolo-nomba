export interface LogMeta {
  [key: string]: unknown;
}

export type LogLevel = "fatal" | "error" | "warn" | "info" | "debug";

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  meta?: LogMeta;
}
