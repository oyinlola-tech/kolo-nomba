export interface ITransport {
  log(level: string, message: string, meta?: Record<string, unknown>): void;
}
