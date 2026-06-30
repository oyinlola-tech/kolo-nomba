import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import type { Payment } from "../types/platform.types";

export function usePaymentStatus(paymentId: string | null, enabled = true) {
  return useQuery({
    queryKey: ["payment-status", paymentId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Payment[] | { items: Payment[]; pagination: unknown } }>("/payments/history", {
        params: { _limit: 50 },
      });
      const items = "items" in data.data ? data.data.items : Array.isArray(data.data) ? data.data : [];
      return items.find((p: Payment) => p.id === paymentId) ?? null;
    },
    enabled: enabled && !!paymentId,
    refetchInterval: 5000,
  });
}
