import type { FastifyInstance } from "fastify";
import { WalletController } from "../controllers/wallet.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";

export class WalletRoute {
  private readonly controller: WalletController;
  private readonly authMiddleware: AuthMiddleware;

  constructor() {
    this.controller = new WalletController();
    this.authMiddleware = new AuthMiddleware();
  }

  register(app: FastifyInstance, prefix: string): void {
    app.get(`${prefix}/wallets/:id`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.getById.bind(this.controller),
    });

    app.get(`${prefix}/wallets/:id/balance`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.getBalance.bind(this.controller),
    });

    app.post(`${prefix}/wallets/transfer`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.transfer.bind(this.controller),
    });
  }
}
