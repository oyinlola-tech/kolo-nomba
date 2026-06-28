import { apiClient } from "../api/client";
import type { DashboardAnalytics } from "../types/platform.types";

export async function getPlatformAnalytics(): Promise<DashboardAnalytics> {
  const { data } = await apiClient.get<{ data: DashboardAnalytics }>("/admin/dashboard");
  return data.data;
}

export async function getGroupAnalytics(groupId: string): Promise<DashboardAnalytics> {
  const { data } = await apiClient.get<{ data: DashboardAnalytics }>(`/admin/dashboard?groupId=${groupId}`);
  return data.data;
}
