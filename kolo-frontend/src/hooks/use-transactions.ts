import { useQuery } from "@tanstack/react-query";
import { getTransactions } from "../services/transaction.service";

export function useTransactions(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["transactions", page, limit],
    queryFn: () => getTransactions(page, limit),
  });
}
