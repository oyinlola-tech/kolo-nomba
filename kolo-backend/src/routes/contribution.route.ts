import type { FastifyInstance } from "fastify";
import { ContributionController } from "../controllers/contribution.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { GroupMiddleware } from "../middleware/group.middleware";

export class ContributionRoute {
  private readonly controller: ContributionController;
  private readonly authMiddleware: AuthMiddleware;
  private readonly groupMiddleware: GroupMiddleware;

  constructor() {
    this.controller = new ContributionController();
    this.authMiddleware = new AuthMiddleware();
    this.groupMiddleware = new GroupMiddleware();
  }

  register(app: FastifyInstance, prefix: string): void {
    // Contribution Plans under group scope
    app.post(`${prefix}/groups/:groupId/contribution-plans`, {
      preHandler: [
        this.authMiddleware.authenticate.bind(this.authMiddleware),
        this.groupMiddleware.requireGroupAdmin.bind(this.groupMiddleware),
      ],
      handler: this.controller.createPlan.bind(this.controller),
    });

    app.get(`${prefix}/groups/:groupId/contribution-plans`, {
      preHandler: [
        this.authMiddleware.authenticate.bind(this.authMiddleware),
        this.groupMiddleware.requireGroupAccess.bind(this.groupMiddleware),
      ],
      handler: this.controller.listPlans.bind(this.controller),
    });

    // Global contribution plan endpoints (authorization handled by service layer via plan -> group resolution)
    app.get(`${prefix}/contribution-plans/:id`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.getPlanById.bind(this.controller),
    });

    app.patch(`${prefix}/contribution-plans/:id`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.updatePlan.bind(this.controller),
    });

    app.delete(`${prefix}/contribution-plans/:id`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.deletePlan.bind(this.controller),
    });

    // Cycles under a plan
    app.get(`${prefix}/contribution-plans/:id/cycles`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.listCycles.bind(this.controller),
    });

    app.get(`${prefix}/contribution-cycles/:id`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.getCycleById.bind(this.controller),
    });

    app.get(`${prefix}/contribution-cycles/:id/dashboard`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.getDashboard.bind(this.controller),
    });

    // Member contributions
    app.get(`${prefix}/contributions/my`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.getMyContributions.bind(this.controller),
    });

    app.get(`${prefix}/groups/:groupId/contributions`, {
      preHandler: [
        this.authMiddleware.authenticate.bind(this.authMiddleware),
        this.groupMiddleware.requireGroupAccess.bind(this.groupMiddleware),
      ],
      handler: this.controller.getGroupContributions.bind(this.controller),
    });

    app.get(`${prefix}/contributions/:id`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.getContributionById.bind(this.controller),
    });
  }
}
