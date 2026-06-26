import { NotificationEventHandler } from "../events/handlers/notification.handler";
import { Logger } from "../logger/core/logger";

export class EventLoader {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("event-loader");
  }

  load(): void {
    new NotificationEventHandler().register();
    this.logger.info("Event handlers loaded");
  }
}
