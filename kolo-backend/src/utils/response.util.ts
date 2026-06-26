import type { FastifyReply } from "fastify";

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errorCode: string;
  errors?: string[];
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export class ResponseUtil {
  static success<T>(reply: FastifyReply, data: T, statusCode = 200, message = "Success"): void {
    const body: ApiSuccessResponse<T> = { success: true, message, data };
    reply.status(statusCode).send(body);
  }

  static created<T>(reply: FastifyReply, data: T): void {
    ResponseUtil.success(reply, data, 201, "Created");
  }

  static noContent(reply: FastifyReply): void {
    reply.status(204).send();
  }

  static error(
    reply: FastifyReply,
    message: string,
    errorCode: string,
    statusCode = 500,
    errors?: string[],
  ): void {
    const body: ApiErrorResponse = { success: false, message, errorCode };
    if (errors) body.errors = errors;
    reply.status(statusCode).send(body);
  }
}
