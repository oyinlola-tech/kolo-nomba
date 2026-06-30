import type { FastifyInstance } from "fastify";
import { AdminController } from "../controllers/admin.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { RoleMiddleware } from "../middleware/role.middleware";
import { CsrfMiddleware } from "../middleware/csrf.middleware";
import { Roles } from "../constants/roles.constant";

export class AdminRoute {
  private readonly controller: AdminController;
  private readonly authMiddleware: AuthMiddleware;
  private readonly superAdminMiddleware: RoleMiddleware;
  private readonly csrfMiddleware: CsrfMiddleware;

  constructor() {
    this.controller = new AdminController();
    this.authMiddleware = new AuthMiddleware();
    this.superAdminMiddleware = new RoleMiddleware(Roles.SUPER_ADMIN);
    this.csrfMiddleware = new CsrfMiddleware();
  }

  register(app: FastifyInstance, prefix: string): void {
    const csrf = this.csrfMiddleware.enforce.bind(this.csrfMiddleware);
    const preHandler = [
      this.authMiddleware.authenticate.bind(this.authMiddleware),
      this.superAdminMiddleware.authorize.bind(this.superAdminMiddleware),
      csrf,
    ];

    const mutationConfig = {
      preHandler,
      config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
    };

    const readConfig = {
      preHandler,
      config: { rateLimit: { max: 60, timeWindow: "1 minute" } },
    };

    // Dashboard
    app.get(`${prefix}/admin/dashboard`, readConfig, this.controller.getDashboard.bind(this.controller));

    // Users
    app.get(`${prefix}/admin/users`, readConfig, this.controller.listUsers.bind(this.controller));
    app.get(`${prefix}/admin/users/:id`, readConfig, this.controller.getUserById.bind(this.controller));
    app.patch(`${prefix}/admin/users/:id/status`, mutationConfig, this.controller.updateUserStatus.bind(this.controller));
    app.patch(`${prefix}/admin/users/:id/verify`, mutationConfig, this.controller.verifyUser.bind(this.controller));

    // Groups
    app.get(`${prefix}/admin/groups`, readConfig, this.controller.listGroups.bind(this.controller));
    app.get(`${prefix}/admin/groups/:id`, readConfig, this.controller.getGroupById.bind(this.controller));
    app.patch(`${prefix}/admin/groups/:id/status`, mutationConfig, this.controller.updateGroupStatus.bind(this.controller));

    // Transactions
    app.get(`${prefix}/admin/transactions`, readConfig, this.controller.listTransactions.bind(this.controller));
    app.get(`${prefix}/admin/transactions/:id`, readConfig, this.controller.getTransactionById.bind(this.controller));

    // Revenue
    app.get(`${prefix}/admin/revenue`, readConfig, this.controller.getRevenue.bind(this.controller));

    // Withdrawals
    app.get(`${prefix}/admin/withdrawals`, readConfig, this.controller.listWithdrawals.bind(this.controller));
    app.patch(`${prefix}/admin/withdrawals/:id/status`, mutationConfig, this.controller.updateWithdrawalStatus.bind(this.controller));

    // Security
    app.get(`${prefix}/admin/security/events`, readConfig, this.controller.listSecurityEvents.bind(this.controller));

    // Settings
    app.get(`${prefix}/admin/settings/notifications`, readConfig, this.controller.getNotificationSettings.bind(this.controller));
    app.patch(`${prefix}/admin/settings/notifications`, mutationConfig, this.controller.updateNotificationSettings.bind(this.controller));
    app.get(`${prefix}/admin/payment-config`, readConfig, this.controller.getPaymentConfig.bind(this.controller));

    // Disputes
    app.get(`${prefix}/admin/disputes`, readConfig, this.controller.listDisputes.bind(this.controller));
    app.post(`${prefix}/admin/disputes/:id/resolve`, mutationConfig, this.controller.resolveDispute.bind(this.controller));

    // Audit
    app.get(`${prefix}/admin/audit-logs`, readConfig, this.controller.listAuditLogs.bind(this.controller));

    // Nomba Monitoring
    app.get(`${prefix}/admin/nomba/status`, readConfig, this.controller.getNombaStatus.bind(this.controller));
    app.get(`${prefix}/admin/nomba/transactions`, readConfig, this.controller.getNombaTransactions.bind(this.controller));
    app.get(`${prefix}/admin/nomba/webhook-events`, readConfig, this.controller.getNombaWebhookEvents.bind(this.controller));
    app.get(`${prefix}/admin/nomba/failed-payments`, readConfig, this.controller.getNombaFailedPayments.bind(this.controller));
    app.get(`${prefix}/admin/nomba/reconciliation`, readConfig, this.controller.getNombaReconciliationResults.bind(this.controller));

    // Background Jobs
    app.get(`${prefix}/admin/jobs`, readConfig, this.controller.listJobs.bind(this.controller));
    app.get(`${prefix}/admin/jobs/queue-stats`, readConfig, this.controller.getQueueStats.bind(this.controller));
    app.get(`${prefix}/admin/jobs/:id`, readConfig, this.controller.getJobById.bind(this.controller));
    app.post(`${prefix}/admin/jobs/:id/retry`, mutationConfig, this.controller.retryJob.bind(this.controller));
  }
}
