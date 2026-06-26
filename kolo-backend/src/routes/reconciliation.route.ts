import type { FastifyInstance } from "fastify";
import { ReconciliationController } from "../controllers/reconciliation.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { RoleMiddleware } from "../middleware/role.middleware";
import { Roles } from "../constants/roles.constant";

export class ReconciliationRoute {
  private readonly controller: ReconciliationController;
  private readonly authMiddleware: AuthMiddleware;
  private readonly superAdminMiddleware: RoleMiddleware;

  constructor() {
    this.controller = new ReconciliationController();
    this.authMiddleware = new AuthMiddleware();
    this.superAdminMiddleware = new RoleMiddleware(Roles.SUPER_ADMIN);
  }

  register(app: FastifyInstance, prefix: string): void {
    const preHandler = [
      this.authMiddleware.authenticate.bind(this.authMiddleware),
      this.superAdminMiddleware.authorize.bind(this.superAdminMiddleware),
    ];

    app.get(`${prefix}/reconciliation`, {
      preHandler,
      handler: this.controller.list.bind(this.controller),
    });

    app.post(`${prefix}/reconciliation/:id/resolve`, {
      preHandler,
      handler: this.controller.resolve.bind(this.controller),
    });
  }
}
