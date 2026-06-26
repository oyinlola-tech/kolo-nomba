import { AppError } from "./app.error";

export class AuthError extends AppError {
  constructor(message = "Authentication failed", errorCode = "AUTH_ERROR") {
    super(message, 401, errorCode);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}
