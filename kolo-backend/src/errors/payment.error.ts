import { AppError } from "./app.error";

export class PaymentError extends AppError {
  constructor(message = "Payment processing failed", errorCode = "PAYMENT_ERROR") {
    super(message, 402, errorCode);
  }
}
