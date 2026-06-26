import type { FastifyInstance } from "fastify";
import { ReconciliationController } from "../controllers/reconciliation.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";

export class ReconciliationRoute {
  private readonly controller: ReconciliationController;
  private readonly authMiddleware: AuthMiddleware;

  constructor() {
    this.controller = new ReconciliationController();
    this.authMiddleware = new AuthMiddleware();
  }

  register(app: FastifyInstance, prefix: string): void {
    app.get(`${prefix}/reconciliation`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.list.bind(this.controller),
    });

    app.post(`${prefix}/reconciliation/:id/resolve`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.resolve.bind(this.controller),
    });
  }
}
