import { z } from "zod";
import { MAX_KOBO } from "../constants/financial.constant";

export const createLedgerEntrySchema = z.object({
  transactionId: z.string().uuid().optional(),
  walletId: z.string().uuid("Invalid wallet ID"),
  entryType: z.enum(["CREDIT", "DEBIT"]),
  amount: z.number().int("Amount must be a whole number").positive("Amount must be positive").max(MAX_KOBO, "Amount exceeds maximum allowed"),
  direction: z.enum(["IN", "OUT"]),
  description: z.string().max(500).optional(),
});

export type CreateLedgerEntryInput = z.infer<typeof createLedgerEntrySchema>;
