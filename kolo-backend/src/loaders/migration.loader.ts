import { execSync } from "child_process";
import { Logger } from "../logger/core/logger";
import { EnvConfig } from "../config/env.config";

export class MigrationLoader {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("migration-loader");
  }

  load(): void {
    const env = EnvConfig.getInstance();
    if (!env.AUTO_MIGRATE) {
      this.logger.info("AUTO_MIGRATE is disabled, skipping migrations");
      return;
    }

    try {
      this.logger.info("Running database migrations...");
      const result = execSync("npx prisma migrate deploy", {
        env: { ...process.env, DATABASE_URL: env.DATABASE_URL },
        stdio: "pipe",
        timeout: 60000,
      });
      this.logger.info("Database migrations completed", { stdout: result.toString() });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const stderr = error instanceof Error && "stderr" in error
        ? Buffer.from((error as { stderr: Buffer }).stderr).toString()
        : "";
      this.logger.error(`Database migration failed: ${message}${stderr ? ` | stderr: ${stderr}` : ""}`);
    }
  }
}
