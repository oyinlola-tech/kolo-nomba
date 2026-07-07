import { exec } from "node:child_process";
import { promisify } from "node:util";
import { Logger } from "../logger/core/logger";
import { EnvConfig } from "../config/env.config";

const asyncExec = promisify(exec);

export class MigrationLoader {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("migration-loader");
  }

  async load(): Promise<void> {
    const env = EnvConfig.getInstance();
    if (!env.AUTO_MIGRATE) {
      this.logger.info("AUTO_MIGRATE is disabled, skipping migrations");
      return;
    }

    try {
      this.logger.info("Running database migrations...");
      const { stdout, stderr } = await asyncExec("npx prisma migrate deploy", {
        env: { ...process.env, DATABASE_URL: env.DATABASE_URL },
        timeout: 60000,
      });
      if (stdout) this.logger.info("Database migrations completed", { stdout });
      if (stderr) this.logger.warn("Migration stderr", { stderr });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const stderr = error instanceof Error && "stderr" in error
        ? String((error as { stderr: string }).stderr)
        : "";
      this.logger.error(`Database migration failed: ${message}${stderr ? ` | stderr: ${stderr}` : ""}`);
    }
  }
}
