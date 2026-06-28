import { z } from "zod";

export const createGroupSchema = z.object({
  name: z.string().min(1, "Group name is required").max(100, "Group name must be at most 100 characters"),
  description: z.string().max(500).optional(),
  category: z.string().max(100).optional(),
  location: z.string().max(200).optional(),
});

export const updateGroupSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  category: z.string().max(100).optional(),
  location: z.string().max(200).optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().min(10, "Phone number must be at least 10 characters").optional(),
}).refine(data => data.email || data.phone, {
  message: "Either email or phone is required",
});

export const acceptInvitationSchema = z.object({
  invitationId: z.string().uuid("Invalid invitation ID"),
});

export const updateGroupSettingsSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  category: z.string().max(100).nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  contributionAmount: z.number().int().positive().nullable().optional(),
  currency: z.string().min(3).max(3).optional(),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "CUSTOM"]).optional(),
  collectionDay: z.number().int().min(1).max(31).nullable().optional(),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;
export type UpdateGroupSettingsInput = z.infer<typeof updateGroupSettingsSchema>;
