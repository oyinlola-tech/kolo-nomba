import { apiClient } from "../api/client";
import type { Payment } from "../types/platform.types";

export async function getPayments(): Promise<Payment[]> {
  const { data } = await apiClient.get<{ data: Payment[] }>("/payments/history");
  return data.data;
}

export interface CreatePaymentPayload {
  amount?: number;
  contributionId: string;
  paymentMethod?: string;
}

export interface InitiatePaymentResponse {
  paymentId: string;
  reference: string;
  paymentUrl: string | null;
}

export async function createPayment(payload: CreatePaymentPayload): Promise<InitiatePaymentResponse> {
  const { data } = await apiClient.post<{ data: InitiatePaymentResponse }>("/payments/initiate", payload);
  return data.data;
}
