import type { LogEntry } from "../core/log.types";

export interface ITransport {
  send(entry: LogEntry): void;
}
