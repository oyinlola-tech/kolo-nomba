import { z } from "zod";

export const updatePreferenceSchema = z.object({
  emailEnabled: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
  whatsappEnabled: z.boolean().optional(),
  securityAlerts: z.boolean().optional(),
  paymentAlerts: z.boolean().optional(),
  marketingMessages: z.boolean().optional(),
});

export type UpdatePreferenceInput = z.infer<typeof updatePreferenceSchema>;
