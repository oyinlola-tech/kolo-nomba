import type { FastifyInstance } from "fastify";
import { PayoutController } from "../controllers/payout.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";

export class PayoutRoute {
  private readonly controller: PayoutController;
  private readonly authMiddleware: AuthMiddleware;

  constructor() {
    this.controller = new PayoutController();
    this.authMiddleware = new AuthMiddleware();
  }

  register(app: FastifyInstance, prefix: string): void {
    const auth = this.authMiddleware.authenticate.bind(this.authMiddleware);

    // Payout CRUD
    app.post(`${prefix}/groups/:groupId/payouts`, { preHandler: auth }, this.controller.create.bind(this.controller));
    app.get(`${prefix}/groups/:groupId/payouts`, { preHandler: auth }, this.controller.listByGroup.bind(this.controller));
    app.get(`${prefix}/payouts/:id`, { preHandler: auth }, this.controller.getById.bind(this.controller));
    app.get(`${prefix}/payouts`, { preHandler: auth }, this.controller.getUserPayouts.bind(this.controller));

    // Payout actions
    app.patch(`${prefix}/payouts/:id/approve`, { preHandler: auth }, this.controller.approve.bind(this.controller));
    app.patch(`${prefix}/payouts/:id/reject`, { preHandler: auth }, this.controller.reject.bind(this.controller));
    app.patch(`${prefix}/payouts/:id/cancel`, { preHandler: auth }, this.controller.cancel.bind(this.controller));
    app.post(`${prefix}/payouts/:id/process`, { preHandler: auth }, this.controller.process.bind(this.controller));

    // Transfer retry and receipts
    app.post(`${prefix}/payouts/:id/retry`, { preHandler: auth }, this.controller.retryFailedTransfer.bind(this.controller));
    app.get(`${prefix}/payouts/:id/receipt`, { preHandler: auth }, this.controller.getReceipt.bind(this.controller));

    // Payout schedules
    app.post(`${prefix}/groups/:groupId/payout-schedules`, { preHandler: auth }, this.controller.createSchedule.bind(this.controller));
    app.get(`${prefix}/groups/:groupId/payout-schedules`, { preHandler: auth }, this.controller.listSchedules.bind(this.controller));
    app.patch(`${prefix}/payout-schedules/:scheduleId/pause`, { preHandler: auth }, this.controller.pauseSchedule.bind(this.controller));

    // Recipient accounts
    app.post(`${prefix}/payout-accounts`, { preHandler: auth }, this.controller.createRecipientAccount.bind(this.controller));
    app.get(`${prefix}/payout-accounts`, { preHandler: auth }, this.controller.listRecipientAccounts.bind(this.controller));
  }
}
