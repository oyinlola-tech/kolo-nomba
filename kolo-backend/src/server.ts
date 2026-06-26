import "dotenv/config";
import { Application } from "./app";
import { Logger } from "./logger/core/logger";

async function main(): Promise<void> {
  const application = new Application();
  await application.start();
}

main().catch((error) => {
  const logger = new Logger("startup");
  logger.fatal("Fatal startup error", { error: String(error) });
  process.exit(1);
});
