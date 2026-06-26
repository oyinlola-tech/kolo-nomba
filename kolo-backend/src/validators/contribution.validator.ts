import { z } from "zod";

export const createContributionPlanSchema = z.object({
  name: z.string().min(1, "Plan name is required").max(200),
  description: z.string().max(500).optional(),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().length(3).default("NGN"),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "CUSTOM"]),
  startDate: z.string().datetime({ message: "Invalid start date" }),
  endDate: z.string().datetime({ message: "Invalid end date" }),
});

export const updateContributionPlanSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
  amount: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "CUSTOM"]).optional(),
  status: z.enum(["ACTIVE", "PAUSED", "COMPLETED"]).optional(),
});

export type CreateContributionPlanInput = z.infer<typeof createContributionPlanSchema>;
export type UpdateContributionPlanInput = z.infer<typeof updateContributionPlanSchema>;
