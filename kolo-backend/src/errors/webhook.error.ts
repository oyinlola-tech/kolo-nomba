import { AppError } from "./app.error";

export class WebhookSignatureError extends AppError {
  constructor(message = "Invalid webhook signature") {
    super(message, 401, "WEBHOOK_SIGNATURE_ERROR");
  }
}

export class WebhookPayloadError extends AppError {
  constructor(message = "Invalid webhook payload") {
    super(message, 422, "WEBHOOK_PAYLOAD_ERROR");
  }
}

export class WebhookNotFoundError extends AppError {
  constructor(message = "Webhook not found") {
    super(message, 404, "WEBHOOK_NOT_FOUND");
  }
}
