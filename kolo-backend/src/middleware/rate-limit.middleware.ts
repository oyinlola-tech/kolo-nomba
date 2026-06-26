import type { FastifyReply, FastifyRequest } from "fastify";

export class RateLimitMiddleware {
  handle(request: FastifyRequest, _reply: FastifyReply): void {
    // Rate limiting is handled globally via @fastify/rate-limit plugin
    // This middleware is a placeholder for future per-route customization
    request.log.debug("Rate limit check passed");
  }
}
