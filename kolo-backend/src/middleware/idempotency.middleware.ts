import type { FastifyReply, FastifyRequest } from "fastify";
import { QueueManager } from "../jobs/queue-manager";
import { Logger } from "../logger/core/logger";

const IDEMPOTENCY_TTL = 86_400;
const IDEMPOTENCY_HEADER = "idempotency-key";

export class IdempotencyMiddleware {
  private readonly logger = new Logger("idempotency-middleware");

  async handle(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    if (request.method !== "POST") return;

    const key = (request.headers[IDEMPOTENCY_HEADER] ?? request.headers[IDEMPOTENCY_HEADER.toUpperCase()]) as string | undefined;
    if (!key) return;

    if (typeof key !== "string" || key.length < 8 || key.length > 256) {
      reply.status(400).send({ success: false, message: "Invalid idempotency key" });
      return;
    }

    const redis = QueueManager.getInstance().getConnection();
    if (!redis) return;

    const cacheKey = `idempotent:${key}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        reply.status(parsed.statusCode).send(parsed.body);
        return;
      }
    } catch {
      this.logger.warn("Idempotency cache read failed, proceeding without dedup", { key });
    }

    const originalSend = reply.send.bind(reply);
    reply.send = (payload: unknown) => {
      const statusCode = reply.statusCode;
      const body = JSON.parse(JSON.stringify(payload));
      redis.set(cacheKey, JSON.stringify({ statusCode, body }), "EX", IDEMPOTENCY_TTL).catch(() => {});
      return originalSend(payload);
    };
  }
}
