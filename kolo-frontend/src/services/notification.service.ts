import { apiClient } from "../api/client";
import type { Notification, NotificationSettings } from "../types/platform.types";

export async function getNotifications(): Promise<Notification[]> {
  const { data } = await apiClient.get<{ data: Notification[] }>("/notifications");
  return data.data;
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const { data } = await apiClient.get<{ data: NotificationSettings }>("/admin/settings/notifications");
  return data.data;
}

export async function updateNotificationSettings(settings: NotificationSettings): Promise<NotificationSettings> {
  const { data } = await apiClient.patch<{ data: NotificationSettings }>("/admin/settings/notifications", settings);
  return data.data;
}
