import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPayouts, requestPayout } from "../services/payout.service";

export function usePayouts(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["payouts", page, limit],
    queryFn: () => getPayouts(page, limit),
  });
}

export function useRequestPayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: requestPayout,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payouts"] }),
  });
}
