import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDisputes, resolveDispute } from "../services/dispute.service";

export function useDisputes() {
  return useQuery({
    queryKey: ["disputes"],
    queryFn: getDisputes,
  });
}

export function useResolveDispute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resolveDispute,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["disputes"] }),
  });
}
