import type { FastifyReply } from "fastify";
import { Logger } from "../logger/core/logger";

interface SSEClient {
  userId: string;
  reply: FastifyReply;
  createdAt: Date;
}

export class SSEManager {
  private static instance: SSEManager;
  private clients: Map<string, SSEClient[]> = new Map();
  private readonly logger = new Logger("sse-manager");

  static getInstance(): SSEManager {
    if (!SSEManager.instance) {
      SSEManager.instance = new SSEManager();
    }
    return SSEManager.instance;
  }

  addClient(userId: string, reply: FastifyReply): void {
    const existing = this.clients.get(userId) ?? [];
    existing.push({ userId, reply, createdAt: new Date() });
    this.clients.set(userId, existing);

    reply.raw.on("close", () => {
      const clients = this.clients.get(userId) ?? [];
      this.clients.set(
        userId,
        clients.filter(c => c.reply !== reply),
      );
      if (this.clients.get(userId)?.length === 0) {
        this.clients.delete(userId);
      }
    });
  }

  sendToUser(userId: string, event: string, data: unknown): void {
    const clients = this.clients.get(userId);
    if (!clients?.length) return;

    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of clients) {
      try {
        client.reply.raw.write(payload);
      } catch {
        this.logger.warn("Failed to send SSE to user", { userId });
      }
    }
  }

  broadcast(event: string, data: unknown): void {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const [, clients] of this.clients) {
      for (const client of clients) {
        try {
          client.reply.raw.write(payload);
        } catch {
          // skip disconnected
        }
      }
    }
  }

  getConnectionCount(): number {
    let count = 0;
    for (const [, clients] of this.clients) {
      count += clients.length;
    }
    return count;
  }
}
