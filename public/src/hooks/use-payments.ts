import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPayment, getPayments } from "../services/payment.service";

export function usePayments() {
  return useQuery({
    queryKey: ["payments"],
    queryFn: getPayments,
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
