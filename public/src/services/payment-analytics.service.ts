import { apiClient } from "../api/client";

export interface PaymentAnalyticsSummary {
  totalContributions: number;
  paidContributions: number;
  pendingContributions: number;
  collectionRate: number;
  totalExpectedAmount: number;
  totalPaidAmount: number;
  outstandingAmount: number;
  activeMembers: number;
}

export interface PaymentAnalytics {
  summary: PaymentAnalyticsSummary;
  recentPayments: Array<{
    id: string;
    amount: number;
    createdAt: string;
  }>;
}

export async function getGroupPaymentAnalytics(groupId: string): Promise<PaymentAnalytics> {
  const { data } = await apiClient.get<{ data: PaymentAnalytics }>(`/analytics/groups/${groupId}/payments`);
  return data.data;
}

export async function getMemberPaymentAnalytics(): Promise<PaymentAnalytics> {
  const { data } = await apiClient.get<{ data: PaymentAnalytics }>("/analytics/mine/payments");
  return data.data;
}
