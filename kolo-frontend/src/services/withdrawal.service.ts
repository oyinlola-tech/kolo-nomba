import { apiClient } from "../api/client";
import type { PaginatedResponse, Withdrawal } from "../types/platform.types";

export async function getWithdrawals(page = 1, limit = 20): Promise<PaginatedResponse<Withdrawal>> {
  const { data } = await apiClient.get<{ data: Withdrawal[] | PaginatedResponse<Withdrawal> }>("/withdrawals", { params: { page, limit } });
  if ("items" in data.data) return data.data;
  return { items: data.data, pagination: { page, limit, total: data.data.length, totalPages: 1, hasNext: false, hasPrev: false } };
}

export async function approveWithdrawal(id: string): Promise<void> {
  await apiClient.post(`/withdrawals/${id}/approve`);
}

export async function rejectWithdrawal(id: string): Promise<void> {
  await apiClient.post(`/withdrawals/${id}/reject`);
}

export async function createWithdrawal(payload: { groupId: string; amount: number; destination?: string }): Promise<Withdrawal> {
  const { data } = await apiClient.post<{ data: Withdrawal }>("/withdrawals", payload);
  return data.data;
}
