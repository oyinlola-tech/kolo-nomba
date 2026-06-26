import { z } from "zod";

export const resolveReconciliationSchema = z.object({
  status: z.enum(["MATCHED", "MISMATCHED", "RESOLVED"]),
  resolvedBy: z.string().optional(),
});

export type ResolveReconciliationInput = z.infer<typeof resolveReconciliationSchema>;
