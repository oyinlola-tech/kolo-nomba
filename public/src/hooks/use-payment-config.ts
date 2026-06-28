import { useQuery } from "@tanstack/react-query";
import { getPaymentConfig } from "../services/payment-config.service";

export function usePaymentConfig() {
  return useQuery({
    queryKey: ["payment-config"],
    queryFn: getPaymentConfig,
  });
}
