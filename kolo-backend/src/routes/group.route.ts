import type { FastifyInstance } from "fastify";
import { GroupController } from "../controllers/group.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { GroupMiddleware } from "../middleware/group.middleware";

export class GroupRoute {
  private readonly controller: GroupController;
  private readonly authMiddleware: AuthMiddleware;
  private readonly groupMiddleware: GroupMiddleware;

  constructor() {
    this.controller = new GroupController();
    this.authMiddleware = new AuthMiddleware();
    this.groupMiddleware = new GroupMiddleware();
  }

  register(app: FastifyInstance, prefix: string): void {
    app.post(`${prefix}/groups`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.create.bind(this.controller),
    });

    app.get(`${prefix}/groups`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.list.bind(this.controller),
    });

    app.get(`${prefix}/groups/invitations`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.listMyInvitations.bind(this.controller),
    });

    app.get(`${prefix}/groups/:id`, {
      preHandler: [
        this.authMiddleware.authenticate.bind(this.authMiddleware),
        this.groupMiddleware.requireGroupAccess.bind(this.groupMiddleware),
      ],
      handler: this.controller.getById.bind(this.controller),
    });

    app.patch(`${prefix}/groups/:id`, {
      preHandler: [
        this.authMiddleware.authenticate.bind(this.authMiddleware),
        this.groupMiddleware.requireGroupAdmin.bind(this.groupMiddleware),
      ],
      handler: this.controller.update.bind(this.controller),
    });

    app.delete(`${prefix}/groups/:id`, {
      preHandler: [
        this.authMiddleware.authenticate.bind(this.authMiddleware),
        this.groupMiddleware.requireGroupOwner.bind(this.groupMiddleware),
      ],
      handler: this.controller.delete.bind(this.controller),
    });

    app.post(`${prefix}/groups/:id/members/invite`, {
      preHandler: [
        this.authMiddleware.authenticate.bind(this.authMiddleware),
        this.groupMiddleware.requireGroupAdmin.bind(this.groupMiddleware),
      ],
      handler: this.controller.inviteMember.bind(this.controller),
    });

    app.post(`${prefix}/groups/invitations/accept`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.acceptInvitation.bind(this.controller),
    });

    app.get(`${prefix}/groups/:id/members`, {
      preHandler: [
        this.authMiddleware.authenticate.bind(this.authMiddleware),
        this.groupMiddleware.requireGroupAccess.bind(this.groupMiddleware),
      ],
      handler: this.controller.listMembers.bind(this.controller),
    });

    app.get(`${prefix}/groups/:id/invitations`, {
      preHandler: [
        this.authMiddleware.authenticate.bind(this.authMiddleware),
        this.groupMiddleware.requireGroupAdmin.bind(this.groupMiddleware),
      ],
      handler: this.controller.listInvitations.bind(this.controller),
    });

    app.delete(`${prefix}/groups/:id/members/:memberId`, {
      preHandler: [
        this.authMiddleware.authenticate.bind(this.authMiddleware),
        this.groupMiddleware.requireGroupAdmin.bind(this.groupMiddleware),
      ],
      handler: this.controller.removeMember.bind(this.controller),
    });

    app.get(`${prefix}/groups/:id/analytics`, {
      preHandler: [
        this.authMiddleware.authenticate.bind(this.authMiddleware),
        this.groupMiddleware.requireGroupAccess.bind(this.groupMiddleware),
      ],
      handler: this.controller.getAnalytics.bind(this.controller),
    });

    app.get(`${prefix}/groups/:id/settings`, {
      preHandler: [
        this.authMiddleware.authenticate.bind(this.authMiddleware),
        this.groupMiddleware.requireGroupAccess.bind(this.groupMiddleware),
      ],
      handler: this.controller.getSettings.bind(this.controller),
    });

    app.put(`${prefix}/groups/:id/settings`, {
      preHandler: [
        this.authMiddleware.authenticate.bind(this.authMiddleware),
        this.groupMiddleware.requireGroupAdmin.bind(this.groupMiddleware),
      ],
      handler: this.controller.updateSettings.bind(this.controller),
    });
  }
}
