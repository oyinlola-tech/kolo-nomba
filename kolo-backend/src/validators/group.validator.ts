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

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;
