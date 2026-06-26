import { useMutation, useQuery } from "@tanstack/react-query";
import { createPayment, getPayments } from "../services/payment.service";

export function usePayments() {
  return useQuery({
    queryKey: ["payments"],
    queryFn: getPayments,
  });
}

export function useCreatePayment() {
  return useMutation({
    mutationFn: createPayment,
  });
}
