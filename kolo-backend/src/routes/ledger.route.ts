import type { FastifyInstance } from "fastify";
import { LedgerController } from "../controllers/ledger.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";

export class LedgerRoute {
  private readonly controller: LedgerController;
  private readonly authMiddleware: AuthMiddleware;

  constructor() {
    this.controller = new LedgerController();
    this.authMiddleware = new AuthMiddleware();
  }

  register(app: FastifyInstance, prefix: string): void {
    app.get(`${prefix}/ledger/:walletId`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.getByWallet.bind(this.controller),
    });
  }
}
