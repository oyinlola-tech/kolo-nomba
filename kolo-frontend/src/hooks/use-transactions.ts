import { useQuery } from "@tanstack/react-query";
import { getTransactions } from "../services/transaction.service";

export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: getTransactions,
  });
}
