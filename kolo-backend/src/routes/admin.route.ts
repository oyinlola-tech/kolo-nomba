import type { FastifyInstance } from "fastify";
import { AdminController } from "../controllers/admin.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { RoleMiddleware } from "../middleware/role.middleware";
import { Roles } from "../constants/roles.constant";

export class AdminRoute {
  private readonly controller: AdminController;
  private readonly authMiddleware: AuthMiddleware;
  private readonly superAdminMiddleware: RoleMiddleware;

  constructor() {
    this.controller = new AdminController();
    this.authMiddleware = new AuthMiddleware();
    this.superAdminMiddleware = new RoleMiddleware(Roles.SUPER_ADMIN);
  }

  register(app: FastifyInstance, prefix: string): void {
    const preHandler = [
      this.authMiddleware.authenticate.bind(this.authMiddleware),
      this.superAdminMiddleware.authorize.bind(this.superAdminMiddleware),
    ];

    // Dashboard
    app.get(`${prefix}/admin/dashboard`, { preHandler }, this.controller.getDashboard.bind(this.controller));

    // Users
    app.get(`${prefix}/admin/users`, { preHandler }, this.controller.listUsers.bind(this.controller));
    app.get(`${prefix}/admin/users/:id`, { preHandler }, this.controller.getUserById.bind(this.controller));
    app.patch(`${prefix}/admin/users/:id/status`, { preHandler }, this.controller.updateUserStatus.bind(this.controller));
    app.patch(`${prefix}/admin/users/:id/verify`, { preHandler }, this.controller.verifyUser.bind(this.controller));

    // Groups
    app.get(`${prefix}/admin/groups`, { preHandler }, this.controller.listGroups.bind(this.controller));
    app.get(`${prefix}/admin/groups/:id`, { preHandler }, this.controller.getGroupById.bind(this.controller));
    app.patch(`${prefix}/admin/groups/:id/status`, { preHandler }, this.controller.updateGroupStatus.bind(this.controller));

    // Transactions
    app.get(`${prefix}/admin/transactions`, { preHandler }, this.controller.listTransactions.bind(this.controller));
    app.get(`${prefix}/admin/transactions/:id`, { preHandler }, this.controller.getTransactionById.bind(this.controller));

    // Revenue
    app.get(`${prefix}/admin/revenue`, { preHandler }, this.controller.getRevenue.bind(this.controller));

    // Withdrawals
    app.get(`${prefix}/admin/withdrawals`, { preHandler }, this.controller.listWithdrawals.bind(this.controller));
    app.patch(`${prefix}/admin/withdrawals/:id/status`, { preHandler }, this.controller.updateWithdrawalStatus.bind(this.controller));

    // Security
    app.get(`${prefix}/admin/security/events`, { preHandler }, this.controller.listSecurityEvents.bind(this.controller));

    // Settings
    app.get(`${prefix}/admin/settings/notifications`, { preHandler }, this.controller.getNotificationSettings.bind(this.controller));
    app.patch(`${prefix}/admin/settings/notifications`, { preHandler }, this.controller.updateNotificationSettings.bind(this.controller));

    // Audit
    app.get(`${prefix}/admin/audit-logs`, { preHandler }, this.controller.listAuditLogs.bind(this.controller));

    // Nomba Monitoring
    app.get(`${prefix}/admin/nomba/status`, { preHandler }, this.controller.getNombaStatus.bind(this.controller));
    app.get(`${prefix}/admin/nomba/transactions`, { preHandler }, this.controller.getNombaTransactions.bind(this.controller));
    app.get(`${prefix}/admin/nomba/webhook-events`, { preHandler }, this.controller.getNombaWebhookEvents.bind(this.controller));
    app.get(`${prefix}/admin/nomba/failed-payments`, { preHandler }, this.controller.getNombaFailedPayments.bind(this.controller));
    app.get(`${prefix}/admin/nomba/reconciliation`, { preHandler }, this.controller.getNombaReconciliationResults.bind(this.controller));

    // Background Jobs
    app.get(`${prefix}/admin/jobs`, { preHandler }, this.controller.listJobs.bind(this.controller));
    app.get(`${prefix}/admin/jobs/queue-stats`, { preHandler }, this.controller.getQueueStats.bind(this.controller));
    app.get(`${prefix}/admin/jobs/:id`, { preHandler }, this.controller.getJobById.bind(this.controller));
    app.post(`${prefix}/admin/jobs/:id/retry`, { preHandler }, this.controller.retryJob.bind(this.controller));
  }
}
