import { apiClient } from "../api/client";

export interface PaymentConfig {
  gateway: string;
  status: string;
  webhookUrl: string;
  feeStructure: {
    percentage: number;
    flatFee: number;
    minAmount: number;
    maxAmount: number;
  };
  lastSync: string | null;
}

export async function getPaymentConfig(): Promise<PaymentConfig> {
  const { data } = await apiClient.get<{ data: PaymentConfig }>("/admin/payment-config");
  return data.data;
}
