import type { FastifyInstance } from "fastify";
import { WithdrawalController } from "../controllers/withdrawal.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { RoleMiddleware } from "../middleware/role.middleware";
import { Roles } from "../constants/roles.constant";

export class WithdrawalRoute {
  private readonly controller: WithdrawalController;
  private readonly authMiddleware: AuthMiddleware;
  private readonly superAdminMiddleware: RoleMiddleware;

  constructor() {
    this.controller = new WithdrawalController();
    this.authMiddleware = new AuthMiddleware();
    this.superAdminMiddleware = new RoleMiddleware(Roles.SUPER_ADMIN);
  }

  register(app: FastifyInstance, prefix: string): void {
    app.post(`${prefix}/withdrawals`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.create.bind(this.controller),
    });

    app.get(`${prefix}/withdrawals`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.list.bind(this.controller),
    });

    app.get(`${prefix}/withdrawals/:id`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.getById.bind(this.controller),
    });

    app.post(`${prefix}/withdrawals/:id/approve`, {
      preHandler: [
        this.authMiddleware.authenticate.bind(this.authMiddleware),
        this.superAdminMiddleware.authorize.bind(this.superAdminMiddleware),
      ],
      handler: this.controller.approve.bind(this.controller),
    });

    app.post(`${prefix}/withdrawals/:id/reject`, {
      preHandler: [
        this.authMiddleware.authenticate.bind(this.authMiddleware),
        this.superAdminMiddleware.authorize.bind(this.superAdminMiddleware),
      ],
      handler: this.controller.reject.bind(this.controller),
    });
  }
}
