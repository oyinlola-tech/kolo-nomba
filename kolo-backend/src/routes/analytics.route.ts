import type { FastifyInstance } from "fastify";
import { AnalyticsController } from "../controllers/analytics.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";

export class AnalyticsRoute {
  private readonly controller: AnalyticsController;
  private readonly authMiddleware: AuthMiddleware;

  constructor() {
    this.controller = new AnalyticsController();
    this.authMiddleware = new AuthMiddleware();
  }

  register(app: FastifyInstance, prefix: string): void {
    app.get(`${prefix}/analytics/groups/:groupId/payments`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.groupPaymentAnalytics.bind(this.controller),
    });

    app.get(`${prefix}/analytics/mine/payments`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.memberPaymentAnalytics.bind(this.controller),
    });
  }
}
