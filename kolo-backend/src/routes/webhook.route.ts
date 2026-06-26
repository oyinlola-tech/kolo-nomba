import { Readable } from "stream";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { WebhookController } from "../controllers/webhook.controller";

export class WebhookRoute {
  private readonly controller: WebhookController;

  constructor() {
    this.controller = new WebhookController();
  }

  register(app: FastifyInstance, prefix: string): void {
    app.post(`${prefix}/webhooks/nomba`, {
      preParsing: (request: FastifyRequest, _reply: FastifyReply, payload, done) => {
        const chunks: Buffer[] = [];
        payload.on("data", (chunk: Buffer) => chunks.push(chunk));
        payload.on("end", () => {
          const raw = Buffer.concat(chunks);
          (request as unknown as Record<string, string>).rawBody = raw.toString();
          done(null, Readable.from(raw));
        });
        payload.on("error", (err) => done(err, undefined));
      },
      handler: (request, reply: FastifyReply) => this.controller.handleNomba(request, reply),
    });
  }
}
