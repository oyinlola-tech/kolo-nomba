import { z } from "zod";

export const createPayoutSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  type: z.enum(["MANUAL", "ROTATION", "CUSTOM"]).optional().default("MANUAL"),
  reason: z.string().max(500).optional(),
  recipients: z.array(z.object({
    userId: z.string().uuid("Invalid user ID"),
    amount: z.number().positive("Recipient amount must be positive"),
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
  amount: z.number().positive("Amount must be positive"),
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
