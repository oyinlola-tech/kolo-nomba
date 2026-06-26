import { EnvConfig } from "./env.config";

export class DatabaseConfig {
  private readonly env: EnvConfig;

  constructor() {
    this.env = EnvConfig.getInstance();
  }

  get url(): string {
    return this.env.DATABASE_URL;
  }
}
