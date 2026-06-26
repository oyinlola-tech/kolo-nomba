import type { FastifyInstance } from "fastify";
import { NotificationController } from "../controllers/notification.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { RoleMiddleware } from "../middleware/role.middleware";
import { Roles } from "../constants/roles.constant";

export class NotificationRoute {
  private readonly controller: NotificationController;
  private readonly authMiddleware: AuthMiddleware;
  private readonly superAdminMiddleware: RoleMiddleware;

  constructor() {
    this.controller = new NotificationController();
    this.authMiddleware = new AuthMiddleware();
    this.superAdminMiddleware = new RoleMiddleware(Roles.SUPER_ADMIN);
  }

  register(app: FastifyInstance, prefix: string): void {
    app.get(`${prefix}/notifications`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.list.bind(this.controller),
    });

    app.get(`${prefix}/notifications/unread`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.unread.bind(this.controller),
    });

    app.patch(`${prefix}/notifications/:id/read`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.markAsRead.bind(this.controller),
    });

    app.patch(`${prefix}/notifications/read-all`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.markAllAsRead.bind(this.controller),
    });

    app.get(`${prefix}/notifications/preferences`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.getPreferences.bind(this.controller),
    });

    app.patch(`${prefix}/notifications/preferences`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.updatePreferences.bind(this.controller),
    });

    app.get(`${prefix}/notifications/:notificationId/deliveries`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.getDeliveries.bind(this.controller),
    });

    app.post(`${prefix}/notifications/retry-failed`, {
      preHandler: [
        this.authMiddleware.authenticate.bind(this.authMiddleware),
        this.superAdminMiddleware.authorize.bind(this.superAdminMiddleware),
      ],
      handler: this.controller.retryFailed.bind(this.controller),
    });
  }
}
