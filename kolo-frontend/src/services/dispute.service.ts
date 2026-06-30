import { apiClient } from "../api/client";
import type { Dispute, PaginatedResponse } from "../types/platform.types";

export async function getDisputes(page = 1, limit = 20): Promise<PaginatedResponse<Dispute>> {
  const { data } = await apiClient.get<{ data: Dispute[] | PaginatedResponse<Dispute> }>("/admin/disputes", { params: { page, limit } });
  if ("items" in data.data) return data.data;
  return { items: data.data, pagination: { page, limit, total: data.data.length, totalPages: 1, hasNext: false, hasPrev: false } };
}

export async function resolveDispute(id: string): Promise<void> {
  await apiClient.post(`/admin/disputes/${id}/resolve`);
}
