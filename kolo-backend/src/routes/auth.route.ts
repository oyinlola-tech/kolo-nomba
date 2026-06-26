import type { FastifyInstance } from "fastify";
import { AuthController } from "../controllers/auth.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";

export class AuthRoute {
  private readonly controller: AuthController;
  private readonly authMiddleware: AuthMiddleware;

  constructor() {
    this.controller = new AuthController();
    this.authMiddleware = new AuthMiddleware();
  }

  register(app: FastifyInstance, prefix: string): void {
    app.post(`${prefix}/auth/register`, {
      config: { rateLimit: { max: 3, timeWindow: "15 minutes" } },
      handler: this.controller.register.bind(this.controller),
    });
    app.post(`${prefix}/auth/login`, {
      config: { rateLimit: { max: 5, timeWindow: "1 minute" } },
      handler: this.controller.login.bind(this.controller),
    });
    app.post(`${prefix}/auth/refresh`, {
      config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
      handler: this.controller.refresh.bind(this.controller),
    });
    app.post(`${prefix}/auth/logout`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.logout.bind(this.controller),
    });
    app.get(`${prefix}/auth/me`, {
      preHandler: this.authMiddleware.authenticate.bind(this.authMiddleware),
      handler: this.controller.me.bind(this.controller),
    });
  }
}
