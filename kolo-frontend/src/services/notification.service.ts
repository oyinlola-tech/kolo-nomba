import { apiClient } from "../api/client";
import type { Notification, NotificationSettings, PaginatedResponse } from "../types/platform.types";

export async function getNotifications(page = 1, limit = 20): Promise<PaginatedResponse<Notification>> {
  const { data } = await apiClient.get<{ data: Notification[] | PaginatedResponse<Notification> }>("/notifications", { params: { page, limit } });
  if ("items" in data.data) return data.data;
  return { items: data.data, pagination: { page, limit, total: data.data.length, totalPages: 1, hasNext: false, hasPrev: false } };
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiClient.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.patch("/notifications/read-all");
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const { data } = await apiClient.get<{ data: NotificationSettings }>("/admin/settings/notifications");
  return data.data;
}

export async function updateNotificationSettings(settings: NotificationSettings): Promise<NotificationSettings> {
  const { data } = await apiClient.patch<{ data: NotificationSettings }>("/admin/settings/notifications", settings);
  return data.data;
}
