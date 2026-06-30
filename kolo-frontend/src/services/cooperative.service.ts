import { apiClient } from "../api/client";
import type { Cooperative, PaginatedResponse } from "../types/platform.types";

export async function getCooperatives(page = 1, limit = 20): Promise<PaginatedResponse<Cooperative>> {
  const { data } = await apiClient.get<{ data: Cooperative[] | PaginatedResponse<Cooperative> }>("/groups", { params: { page, limit } });
  if ("items" in data.data) return data.data;
  return { items: data.data, pagination: { page, limit, total: data.data.length, totalPages: 1, hasNext: false, hasPrev: false } };
}
