import { z } from "zod";
import { MAX_KOBO } from "../constants/financial.constant";

export const createPayoutSchema = z.object({
  amount: z.number().int("Amount must be a whole number").positive("Amount must be positive").max(MAX_KOBO, "Amount exceeds maximum allowed"),
  type: z.enum(["MANUAL", "ROTATION", "CUSTOM"]).optional().default("MANUAL"),
  reason: z.string().max(500).optional(),
  recipients: z.array(z.object({
    userId: z.string().uuid("Invalid user ID"),
    amount: z.number().int("Amount must be a whole number").positive("Recipient amount must be positive").max(MAX_KOBO, "Amount exceeds maximum allowed"),
    destinationAccount: z.string().optional(),
    recipientAccountId: z.string().uuid().optional(),
  })).min(1, "At least one recipient is required"),
});

export const approvalSchema = z.object({
  comment: z.string().max(500).optional(),
});

export const createScheduleSchema = z.object({
  type: z.enum(["ROTATION", "MANUAL", "CUSTOM"]),
  frequency: z.enum(["WEEKLY", "MONTHLY", "CUSTOM"]),
  amount: z.number().int("Amount must be a whole number").positive("Amount must be positive").max(MAX_KOBO, "Amount exceeds maximum allowed"),
  dayOfMonth: z.number().int().min(1).max(31).optional(),
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  customInterval: z.number().int().positive().optional(),
  nextExecutionDate: z.string().refine(val => !isNaN(Date.parse(val)), "Invalid date"),
});

export const createRecipientAccountSchema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(10, "Account number must be at least 10 digits").max(10, "Account number must be 10 digits"),
  accountName: z.string().min(1, "Account name is required"),
});

export type CreatePayoutInput = z.infer<typeof createPayoutSchema>;
export type ApprovalInput = z.infer<typeof approvalSchema>;
export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type CreateRecipientAccountInput = z.infer<typeof createRecipientAccountSchema>;
