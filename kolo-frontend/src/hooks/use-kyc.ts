import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getKycSubmissions, approveKyc, rejectKyc } from "../services/kyc.service";

export function useKycSubmissions() {
  return useQuery({
    queryKey: ["kyc"],
    queryFn: getKycSubmissions,
  });
}

export function useApproveKyc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveKyc,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["kyc"] }),
  });
}

export function useRejectKyc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectKyc,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["kyc"] }),
  });
}
