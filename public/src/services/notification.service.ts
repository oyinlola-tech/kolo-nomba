import { apiClient } from "../api/client";
import type { Notification } from "../types/platform.types";

export async function getNotifications(): Promise<Notification[]> {
  const { data } = await apiClient.get<{ data: Notification[] }>("/notifications");
  return data.data;
}
