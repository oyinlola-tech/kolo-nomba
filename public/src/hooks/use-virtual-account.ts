import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyVirtualAccount, createVirtualAccount } from "../services/virtual-account.service";

export function useVirtualAccount() {
  return useQuery({
    queryKey: ["virtual-account"],
    queryFn: getMyVirtualAccount,
  });
}

export function useCreateVirtualAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVirtualAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["virtual-account"] });
    },
  });
}
