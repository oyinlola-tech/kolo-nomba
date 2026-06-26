import { z } from "zod";

export const PAYMENT_METHODS = [
  "card",
  "bank_transfer",
  "ussd",
  "mobile_money",
  "wallet",
] as const;

export const initiatePaymentSchema = z.object({
  contributionId: z.string().uuid("Invalid contribution ID"),
  amount: z.number().int("Amount must be a whole number").positive("Amount must be positive").max(100_000_000, "Amount exceeds maximum allowed"),
  paymentMethod: z.enum(PAYMENT_METHODS, { errorMap: () => ({ message: `Payment method must be one of: ${PAYMENT_METHODS.join(", ")}` }) }),
});

export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;
