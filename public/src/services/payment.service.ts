import { apiClient } from "../api/client";
import type { Payment } from "../types/platform.types";

export async function getPayments(): Promise<Payment[]> {
  const { data } = await apiClient.get<{ data: Payment[] }>("/payments/history");
  return data.data;
}

export async function createPayment(payload: { amount: number; contributionId: string }): Promise<Payment> {
  const { data } = await apiClient.post<{ data: Payment }>("/payments/initiate", payload);
  return data.data;
}
