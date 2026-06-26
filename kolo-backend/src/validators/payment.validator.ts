import { z } from "zod";

export const initiatePaymentSchema = z.object({
  contributionId: z.string().uuid("Invalid contribution ID"),
  amount: z.number().positive("Amount must be positive"),
  paymentMethod: z.string().min(1, "Payment method is required"),
});

export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;
