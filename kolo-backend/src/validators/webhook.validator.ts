import { z } from "zod";

const paymentDataSchema = z.object({
  paymentId: z.string().min(1).optional(),
  payment_id: z.string().min(1).optional(),
  reference: z.string().min(1).optional(),
  providerReference: z.string().min(1).optional(),
  transactionReference: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
}).optional();

const virtualAccountDataSchema = z.object({
  accountNumber: z.string().min(1).optional(),
  account_number: z.string().min(1).optional(),
  reference: z.string().min(1).optional(),
  providerReference: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
}).optional();

export const nombaWebhookPayloadSchema = z.object({
  event: z.string().optional(),
  eventType: z.string().optional(),
  type: z.string().optional(),
  id: z.string().optional(),
  eventId: z.string().optional(),
  event_id: z.string().optional(),
  data: z.union([paymentDataSchema, virtualAccountDataSchema]).optional(),
}).passthrough();

export const webhookEventTypeSchema = z.enum([
  "payment.success",
  "charge.success",
  "payment_success",
  "payment.failed",
  "charge.failed",
  "payment_failed",
  "payment_reversal",
  "transfer_success",
  "transfer.failed",
  "transfer_failed",
  "virtual_account_created",
  "virtual_account_transaction",
]);

export type NombaWebhookPayload = z.infer<typeof nombaWebhookPayloadSchema>;
