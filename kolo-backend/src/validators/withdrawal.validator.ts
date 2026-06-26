import { z } from "zod";

export const createWithdrawalSchema = z.object({
  walletId: z.string().uuid("Invalid wallet ID"),
  amount: z.number().positive("Amount must be positive"),
  destination: z.string().optional(),
});

export type CreateWithdrawalInput = z.infer<typeof createWithdrawalSchema>;
