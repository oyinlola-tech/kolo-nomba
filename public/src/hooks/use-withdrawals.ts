import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWithdrawals, approveWithdrawal, rejectWithdrawal } from "../services/withdrawal.service";

export function useWithdrawals() {
  return useQuery({
    queryKey: ["withdrawals"],
    queryFn: getWithdrawals,
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
