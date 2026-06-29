import { apiClient } from "../api/client";
import type { Payment } from "../types/platform.types";

function generateIdempotencyKey(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, "0")).join("");
}

export async function getPayments(page = 1, limit = 20): Promise<{ items: Payment[]; pagination: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean } }> {
  const { data } = await apiClient.get<{ data: { items: Payment[]; pagination: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean } } }>("/payments/history", { params: { page, limit } });
  return data.data;
}

export interface CreatePaymentPayload {
  amount?: number;
  contributionId: string;
  paymentMethod?: string;
}

export interface VirtualAccountInfo {
  accountNumber: string;
  accountName: string;
  bankName: string;
  amount: number;
}

export interface InitiatePaymentResponse {
  paymentId: string;
  reference: string;
  checkoutUrl: string | null;
  virtualAccount?: VirtualAccountInfo | null;
}

export async function createPayment(payload: CreatePaymentPayload): Promise<InitiatePaymentResponse> {
  const idempotencyKey = generateIdempotencyKey();
  const { data } = await apiClient.post<{ data: InitiatePaymentResponse }>(
    "/payments/initiate",
    payload,
    { headers: { "Idempotency-Key": idempotencyKey } },
  );
  return data.data;
}
