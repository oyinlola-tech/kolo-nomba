import { z } from "zod";

export const createCooperativeSchema = z.object({
  name: z.string().min(1, "Cooperative name is required"),
  description: z.string().optional(),
  contributionAmount: z.number().positive("Contribution amount must be positive"),
  frequency: z.enum(["daily", "weekly", "monthly"]),
});

export type CreateCooperativeInput = z.infer<typeof createCooperativeSchema>;
