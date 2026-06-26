import type { FastifyInstance } from "fastify";
import { UserController } from "../controllers/user.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";

export class UserRoute {
  private readonly controller: UserController;
  private readonly authMiddleware: AuthMiddleware;

  constructor() {
    this.controller = new UserController();
    this.authMiddleware = new AuthMiddleware();
  }

  register(app: FastifyInstance, prefix: string): void {
    app.get(`${prefix}/users/profile`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.getProfile.bind(this.controller),
    });
    app.patch(`${prefix}/users/profile`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.updateProfile.bind(this.controller),
    });
    app.patch(`${prefix}/users/password`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.changePassword.bind(this.controller),
    });
  }
}
