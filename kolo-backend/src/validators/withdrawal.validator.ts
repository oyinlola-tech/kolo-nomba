import { z } from "zod";
import { MAX_KOBO } from "../constants/financial.constant";

export const createWithdrawalSchema = z.object({
  groupId: z.string().uuid("Invalid group ID"),
  amount: z.number().int("Amount must be a whole number").positive("Amount must be positive").max(MAX_KOBO, "Amount exceeds maximum allowed"),
  destination: z.string().optional(),
  destinationBank: z.string().min(1, "Bank code is required"),
  accountName: z.string().min(1, "Account name is required"),
});

export type CreateWithdrawalInput = z.infer<typeof createWithdrawalSchema>;
