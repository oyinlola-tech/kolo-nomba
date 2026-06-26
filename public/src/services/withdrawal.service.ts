import { apiClient } from "../api/client";
import type { Withdrawal } from "../types/platform.types";

export async function getWithdrawals(): Promise<Withdrawal[]> {
  const { data } = await apiClient.get<{ data: Withdrawal[] }>("/withdrawals");
  return data.data;
}

export async function approveWithdrawal(id: string): Promise<void> {
  await apiClient.post(`/withdrawals/${id}/approve`);
}

export async function rejectWithdrawal(id: string): Promise<void> {
  await apiClient.post(`/withdrawals/${id}/reject`);
}
