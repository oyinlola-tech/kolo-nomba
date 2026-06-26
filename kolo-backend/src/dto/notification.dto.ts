export interface CreateNotificationDto {
  userId: string;
  type: string;
  title: string;
  message: string;
  channel?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationResponse {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  channel: string;
  status: string;
  metadata: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationPreferenceResponse {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  whatsappEnabled: boolean;
  securityAlerts?: boolean;
  paymentAlerts?: boolean;
  marketingMessages?: boolean;
}

export interface UpdatePreferenceDto {
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  pushEnabled?: boolean;
  whatsappEnabled?: boolean;
  securityAlerts?: boolean;
  paymentAlerts?: boolean;
  marketingMessages?: boolean;
}

export interface NotificationDeliveryResponse {
  id: string;
  notificationId: string;
  channel: string;
  status: string;
  provider: string | null;
  providerReference: string | null;
  attempts: number;
  failureReason: string | null;
  sentAt: string | null;
  createdAt: string;
}
