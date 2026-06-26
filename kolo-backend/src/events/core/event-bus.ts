import { Event } from "./event";
import { Logger } from "../../logger/core/logger";

export type EventHandler = (event: Event) => Promise<void> | void;

export class EventBus {
  private static instance: EventBus;
  private readonly handlers: Map<string, EventHandler[]>;
  private readonly logger: Logger;

  private constructor() {
    this.handlers = new Map();
    this.logger = new Logger("event-bus");
  }

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  subscribe(eventName: string, handler: EventHandler): void {
    const existing = this.handlers.get(eventName) ?? [];
    existing.push(handler);
    this.handlers.set(eventName, existing);
    this.logger.debug("Handler subscribed", { eventName });
  }

  async publish(event: Event): Promise<void> {
    const handlers = this.handlers.get(event.name) ?? [];
    const wildcardHandlers = this.handlers.get("*") ?? [];
    const allHandlers = [...handlers, ...wildcardHandlers];

    this.logger.debug("Event published", { eventName: event.name, handlers: allHandlers.length });

    for (const handler of allHandlers) {
      try {
        await handler(event);
      } catch (error) {
        this.logger.error("Event handler failed", {
          eventName: event.name,
          error: String(error),
        });
      }
    }
  }
}
