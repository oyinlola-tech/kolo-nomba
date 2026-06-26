import type { FastifyInstance } from "fastify";
import { FinancialTransactionController } from "../controllers/financial-transaction.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";

export class FinancialTransactionRoute {
  private readonly controller: FinancialTransactionController;
  private readonly authMiddleware: AuthMiddleware;

  constructor() {
    this.controller = new FinancialTransactionController();
    this.authMiddleware = new AuthMiddleware();
  }

  register(app: FastifyInstance, prefix: string): void {
    app.get(`${prefix}/transactions`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.list.bind(this.controller),
    });

    app.get(`${prefix}/transactions/:id`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.getById.bind(this.controller),
    });
  }
}
