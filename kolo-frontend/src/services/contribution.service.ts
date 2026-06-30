import { apiClient } from "../api/client";
import type { Contribution, PaginatedResponse } from "../types/platform.types";

export async function getContributions(page = 1, limit = 20): Promise<PaginatedResponse<Contribution>> {
  const { data } = await apiClient.get<{ data: Contribution[] | PaginatedResponse<Contribution> }>("/contributions/my", { params: { page, limit } });
  if ("items" in data.data) return data.data;
  return { items: data.data, pagination: { page, limit, total: data.data.length, totalPages: 1, hasNext: false, hasPrev: false } };
}

export async function getContributionById(contributionId: string): Promise<Contribution> {
  const { data } = await apiClient.get<{ data: Contribution }>(`/contributions/${contributionId}`);
  return data.data;
}
