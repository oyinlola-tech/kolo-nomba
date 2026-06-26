import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../errors/app.error";
import { ValidationError } from "../errors/validation.error";
import { Logger } from "../logger/core/logger";
import { ResponseUtil } from "../utils/response.util";
import { EnvConfig } from "../config/env.config";

export class ErrorMiddleware {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger("error-middleware");
  }

  handle(error: FastifyError | AppError | Error, request: FastifyRequest, reply: FastifyReply): void {
    if (error instanceof AppError) {
      this.logger.warn("Operational error", {
        errorCode: error.errorCode,
        message: error.message,
        path: request.url,
      });

      const errors: string[] = [];
      if (error instanceof ValidationError && error.details) {
        for (const key of Object.keys(error.details)) {
          for (const msg of error.details[key]) {
            errors.push(`${key}: ${msg}`);
          }
        }
      }

      ResponseUtil.error(reply, error.message, error.errorCode, error.statusCode, errors.length > 0 ? errors : undefined);
      return;
    }

    this.logger.error("Unexpected error", {
      message: error.message,
      stack: EnvConfig.getInstance().isDevelopment ? error.stack : undefined,
      path: request.url,
    });

    ResponseUtil.error(reply, "An unexpected error occurred", "INTERNAL_ERROR", 500);
  }
}
