import { apiClient } from "../api/client";
import type { PaginatedResponse, Payout } from "../types/platform.types";

export async function getPayouts(page = 1, limit = 20): Promise<PaginatedResponse<Payout>> {
  const { data } = await apiClient.get<{ data: Payout[] | PaginatedResponse<Payout> }>("/payouts", { params: { page, limit } });
  if ("items" in data.data) return data.data;
  return { items: data.data, pagination: { page, limit, total: data.data.length, totalPages: 1, hasNext: false, hasPrev: false } };
}

export async function requestPayout(payload: { amount: number; groupId: string; bankAccountId?: string }): Promise<Payout> {
  const { groupId, ...rest } = payload;
  const { data } = await apiClient.post<{ data: Payout }>(`/groups/${groupId}/payouts`, { amount: rest.amount, bankAccountId: rest.bankAccountId });
  return data.data;
}
