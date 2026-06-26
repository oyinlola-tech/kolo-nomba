import type { FastifyInstance } from "fastify";
import { PaymentController } from "../controllers/payment.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";

export class PaymentRoute {
  private readonly controller: PaymentController;
  private readonly authMiddleware: AuthMiddleware;

  constructor() {
    this.controller = new PaymentController();
    this.authMiddleware = new AuthMiddleware();
  }

  register(app: FastifyInstance, prefix: string): void {
    app.post(`${prefix}/payments/initiate`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
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
  }
}
