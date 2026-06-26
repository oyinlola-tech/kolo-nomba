import type { LogEntry } from "../core/log.types";
import type { ITransport } from "./transport.interfaces";

export class ConsoleTransport implements ITransport {
  send(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
    const meta = entry.meta ? ` ${JSON.stringify(entry.meta)}` : "";
    process.stdout.write(`${prefix}: ${entry.message}${meta}\n`);
  }
}
