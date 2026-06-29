import { useQuery } from "@tanstack/react-query";
import { getGroupPaymentAnalytics, getMemberPaymentAnalytics } from "../services/payment-analytics.service";

export function useGroupPaymentAnalytics(groupId: string) {
  return useQuery({
    queryKey: ["payment-analytics", "group", groupId],
    queryFn: () => getGroupPaymentAnalytics(groupId),
    enabled: Boolean(groupId),
  });
}

export function useMemberPaymentAnalytics() {
  return useQuery({
    queryKey: ["payment-analytics", "mine"],
    queryFn: getMemberPaymentAnalytics,
  });
}
