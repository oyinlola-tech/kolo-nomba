import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDisputes, resolveDispute } from "../services/dispute.service";

export function useDisputes(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["disputes", page, limit],
    queryFn: () => getDisputes(page, limit),
  });
}

export function useResolveDispute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resolveDispute,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["disputes"] }),
  });
}
