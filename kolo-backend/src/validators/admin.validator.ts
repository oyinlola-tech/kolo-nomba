import { z } from "zod";

export const updateUserStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "PENDING"]),
});

export const updateGroupStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "COMPLETED"]),
});

export const updateWithdrawalStatusSchema = z.object({
  status: z.enum(["COMPLETED", "FAILED", "CANCELLED"]),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const transactionFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  type: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  userId: z.string().uuid().optional(),
});

export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type UpdateGroupStatusInput = z.infer<typeof updateGroupStatusSchema>;
export type UpdateWithdrawalStatusInput = z.infer<typeof updateWithdrawalStatusSchema>;
