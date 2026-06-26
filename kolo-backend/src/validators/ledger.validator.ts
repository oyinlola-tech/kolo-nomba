import { z } from "zod";

export const createLedgerEntrySchema = z.object({
  transactionId: z.string().uuid().optional(),
  walletId: z.string().uuid("Invalid wallet ID"),
  entryType: z.enum(["CREDIT", "DEBIT"]),
  amount: z.number().positive("Amount must be positive"),
  direction: z.enum(["IN", "OUT"]),
  description: z.string().max(500).optional(),
});

export type CreateLedgerEntryInput = z.infer<typeof createLedgerEntrySchema>;
