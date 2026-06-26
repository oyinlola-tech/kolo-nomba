import { z } from "zod";

export const resolveReconciliationSchema = z.object({
  status: z.enum(["MATCHED", "MISMATCHED", "RESOLVED"]),
  resolvedBy: z.string().min(1, "Resolver name is required"),
});

export type ResolveReconciliationInput = z.infer<typeof resolveReconciliationSchema>;
