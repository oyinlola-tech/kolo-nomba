import { Readable } from "stream";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { WebhookController } from "../controllers/webhook.controller";

const WEBHOOK_BODY_LIMIT = 524_288;

export class WebhookRoute {
  private readonly controller: WebhookController;

  constructor() {
    this.controller = new WebhookController();
  }

  register(app: FastifyInstance, prefix: string): void {
    app.post(`${prefix}/webhooks/nomba`, {
      preParsing: (request: FastifyRequest, reply: FastifyReply, payload, done) => {
        const chunks: Buffer[] = [];
        let size = 0;
        let aborted = false;
        payload.on("data", (chunk: Buffer) => {
          if (aborted) return;
          size += chunk.length;
          if (size > WEBHOOK_BODY_LIMIT) {
            aborted = true;
            payload.destroy();
            reply.status(413).send({ success: false, message: "Body exceeds the allowed size limit" });
            return;
          }
          chunks.push(chunk);
        });
        payload.on("end", () => {
          if (aborted) return;
          const raw = Buffer.concat(chunks);
          (request as unknown as Record<string, string>).rawBody = raw.toString();
          done(null, Readable.from(raw));
        });
        payload.on("error", (err) => {
          if (!aborted) done(err, undefined);
        });
      },
      handler: (request, reply: FastifyReply) => this.controller.handleNomba(request, reply),
    });
  }
}
