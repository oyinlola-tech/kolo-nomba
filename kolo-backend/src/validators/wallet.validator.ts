import { z } from "zod";
import { MAX_KOBO } from "../constants/financial.constant";

export const createWalletSchema = z.object({
  ownerType: z.enum(["USER", "GROUP", "PLATFORM"]),
  ownerId: z.string().uuid("Invalid owner ID"),
  currency: z.string().length(3).default("NGN"),
});

export const transferSchema = z.object({
  sourceWalletId: z.string().uuid("Invalid source wallet"),
  destinationWalletId: z.string().uuid("Invalid destination wallet"),
  amount: z.number().int("Amount must be a whole number").positive("Amount must be positive").max(MAX_KOBO, "Amount exceeds maximum allowed"),
  description: z.string().max(500).optional(),
});

export type CreateWalletInput = z.infer<typeof createWalletSchema>;
export type TransferInput = z.infer<typeof transferSchema>;
