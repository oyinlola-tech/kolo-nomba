import type { LogEntry } from "../core/log.types";
import type { ITransport } from "./transport.interfaces";

export class DatabaseTransport implements ITransport {
  send(_entry: LogEntry): void {
    // Will be implemented when audit log repository is available
  }
}
