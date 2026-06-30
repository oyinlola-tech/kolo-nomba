import { apiClient } from "../api/client";
import type { PaginatedResponse, Transaction } from "../types/platform.types";

export async function getTransactions(page = 1, limit = 20): Promise<PaginatedResponse<Transaction>> {
  const { data } = await apiClient.get<{ data: Transaction[] | PaginatedResponse<Transaction> }>("/transactions", { params: { page, limit } });
  if ("items" in data.data) return data.data;
  return { items: data.data, pagination: { page, limit, total: data.data.length, totalPages: 1, hasNext: false, hasPrev: false } };
}
