import type { FastifyInstance } from "fastify";
import { VirtualAccountController } from "../controllers/virtual-account.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";

export class VirtualAccountRoute {
  private readonly controller: VirtualAccountController;
  private readonly authMiddleware: AuthMiddleware;

  constructor() {
    this.controller = new VirtualAccountController();
    this.authMiddleware = new AuthMiddleware();
  }

  register(app: FastifyInstance, prefix: string): void {
    app.get(`${prefix}/virtual-accounts/my`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.getMyAccount.bind(this.controller),
    });

    app.post(`${prefix}/virtual-accounts`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.create.bind(this.controller),
    });

    app.get(`${prefix}/virtual-accounts/:id`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.getById.bind(this.controller),
    });
  }
}
