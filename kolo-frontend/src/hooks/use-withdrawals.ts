import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWithdrawals, approveWithdrawal, rejectWithdrawal } from "../services/withdrawal.service";

export function useWithdrawals(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["withdrawals", page, limit],
    queryFn: () => getWithdrawals(page, limit),
  });
}

export function useApproveWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveWithdrawal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["withdrawals"] }),
  });
}

export function useRejectWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectWithdrawal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["withdrawals"] }),
  });
}
