import "dotenv/config";
import { Application } from "./app";

async function main(): Promise<void> {
  const application = new Application();
  await application.start();
}

main().catch((error) => {
  console.error("FATAL: Startup error:", error instanceof Error ? error.message : String(error));
  console.error(error instanceof Error ? error.stack : "");
  process.exit(1);
});
