import { apiClient } from "../api/client";
import type { Transaction } from "../types/platform.types";

export async function getTransactions(): Promise<Transaction[]> {
  const { data } = await apiClient.get<{ data: Transaction[] }>("/transactions");
  return data.data;
}
