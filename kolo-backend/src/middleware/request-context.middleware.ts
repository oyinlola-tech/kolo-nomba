import type { FastifyReply, FastifyRequest } from "fastify";
import { randomUUID } from "crypto";

declare module "fastify" {
  interface FastifyRequest {
    requestId: string;
    startTime: number;
  }
}

export class RequestContextMiddleware {
  handle(request: FastifyRequest, _reply: FastifyReply): void {
    request.requestId = (request.headers["x-request-id"] as string) ?? randomUUID();
    request.startTime = Date.now();
  }
}
