import { apiClient } from "../api/client";
import type { Dispute } from "../types/platform.types";

export async function getDisputes(): Promise<Dispute[]> {
  const { data } = await apiClient.get<{ data: Dispute[] }>("/admin/disputes");
  return data.data;
}

export async function resolveDispute(id: string): Promise<void> {
  await apiClient.post(`/admin/disputes/${id}/resolve`);
}
