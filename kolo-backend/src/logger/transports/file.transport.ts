import { appendFileSync } from "fs";
import { join } from "path";
import type { LogEntry } from "../core/log.types";
import type { ITransport } from "./transport.interfaces";

const WINDOWS_RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$/i;

export class FileTransport implements ITransport {
  private readonly filePath: string;

  constructor(filename = "app.log") {
    if (WINDOWS_RESERVED.test(filename)) {
      throw new Error(`Invalid filename: "${filename}" is a reserved Windows device name`);
    }
    this.filePath = join(process.cwd(), "logs", filename);
  }

  send(entry: LogEntry): void {
    const line = JSON.stringify(entry) + "\n";
    appendFileSync(this.filePath, line, "utf-8");
  }
}
