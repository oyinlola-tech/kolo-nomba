import type { FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { AppConfig } from "../config/app.config";
import { Logger } from "../logger/core/logger";

export class SwaggerLoader {
  private readonly logger: Logger;
  private readonly config: AppConfig;

  constructor() {
    this.logger = new Logger("swagger-loader");
    this.config = new AppConfig();
  }

  async load(app: FastifyInstance): Promise<void> {
    if (!this.config.isDevelopment) {
      this.logger.info("Swagger disabled in production");
      return;
    }

    await app.register(swagger, {
      openapi: {
        info: {
          title: "KOLO API",
          description: "Digital Cooperative Savings Platform API",
          version: "1.0.0",
        },
        servers: [{ url: `http://localhost:${this.config.port}` }],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
            },
          },
        },
      },
    });

    await app.register(swaggerUi, {
      routePrefix: this.config.swaggerPath,
      uiConfig: {
        docExpansion: "list",
        deepLinking: true,
      },
    });

    this.logger.info(`Swagger UI available at ${this.config.swaggerPath}`);
  }
}
