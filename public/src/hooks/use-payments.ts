import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPayment, getPayments } from "../services/payment.service";

export function usePayments(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["payments", page, limit],
    queryFn: () => getPayments(page, limit),
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["contributions"] });
    },
  });
}
