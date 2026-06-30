import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPayouts, requestPayout } from "../services/payout.service";

export function usePayouts() {
  return useQuery({
    queryKey: ["payouts"],
    queryFn: getPayouts,
  });
}

export function useRequestPayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: requestPayout,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payouts"] }),
  });
}
