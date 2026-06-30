import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "../app/store";
import { updateProfile } from "../services/auth.service";
import type { AuthUser } from "../types/auth.types";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setSession = useAppStore((state) => state.setSession);

  return useMutation({
    mutationFn: (payload: Partial<Pick<AuthUser, "firstName" | "lastName" | "phone" | "email">>) => updateProfile(payload),
    onSuccess: (result) => {
      setSession(result, useAppStore.getState().accessToken ?? "");
      queryClient.invalidateQueries({ queryKey: ["auth", "profile"] });
    },
  });
}
