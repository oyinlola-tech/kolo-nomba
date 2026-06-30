import { apiClient } from "../api/client";
import type { Payout } from "../types/platform.types";

export async function getPayouts(): Promise<Payout[]> {
  const { data } = await apiClient.get<{ data: Payout[] }>("/payouts");
  return data.data;
}

export async function requestPayout(payload: { amount: number; groupId: string; bankAccountId?: string }): Promise<Payout> {
  const { data } = await apiClient.post<{ data: Payout }>(`/groups/${payload.groupId}/payouts`, payload);
  return data.data;
}
