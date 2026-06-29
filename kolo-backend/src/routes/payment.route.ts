import type { FastifyInstance } from "fastify";
import { PaymentController } from "../controllers/payment.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { IdempotencyMiddleware } from "../middleware/idempotency.middleware";

export class PaymentRoute {
  private readonly controller: PaymentController;
  private readonly authMiddleware: AuthMiddleware;
  private readonly idempotencyMiddleware: IdempotencyMiddleware;

  constructor() {
    this.controller = new PaymentController();
    this.authMiddleware = new AuthMiddleware();
    this.idempotencyMiddleware = new IdempotencyMiddleware();
  }

  register(app: FastifyInstance, prefix: string): void {
    app.post(`${prefix}/payments/initiate`, {
      preHandler: [
        this.authMiddleware.authenticate.bind(this.authMiddleware),
        this.idempotencyMiddleware.handle.bind(this.idempotencyMiddleware),
      ],
      handler: this.controller.initiate.bind(this.controller),
    });

    app.get(`${prefix}/payments/history`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.history.bind(this.controller),
    });

    app.get(`${prefix}/payments/:id`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.getById.bind(this.controller),
    });

    app.get(`${prefix}/contributions/:id/payments`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.getContributionPayments.bind(this.controller),
    });

    app.get(`${prefix}/payments/receipt/:reference`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.receipt.bind(this.controller),
    });
  }
}
