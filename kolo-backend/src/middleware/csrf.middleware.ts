import type { FastifyReply, FastifyRequest } from "fastify";
import { ValidationError } from "../errors/validation.error";

export class CsrfMiddleware {
  async enforce(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
    const origin = request.headers["x-requested-with"];
    if (origin !== "XMLHttpRequest") {
      throw new ValidationError("Missing anti-CSRF header");
    }
  }
}
