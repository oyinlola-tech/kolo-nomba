import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "../app/store";
import * as authService from "../services/auth.service";
import type { LoginPayload, RegisterPayload } from "../services/auth.service";

export function useAuth() {
  const queryClient = useQueryClient();
  const user = useAppStore((state) => state.user);
  const role = useAppStore((state) => state.role);
  const accessToken = useAppStore((state) => state.accessToken);
  const setSession = useAppStore((state) => state.setSession);
  const clearSession = useAppStore((state) => state.clearSession);

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (result) => {
      if ("challengeId" in result) return;
      setSession(result.user, result.accessToken);
      queryClient.invalidateQueries({ queryKey: ["auth", "profile"] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      clearSession();
      queryClient.clear();
    },
  });

  const profileQuery = useQuery({
    queryKey: ["auth", "profile"],
    queryFn: authService.getProfile,
    enabled: !!accessToken,
    retry: false,
  });

  const isAuthenticated = Boolean(accessToken);
  const isSuperAdmin = role === "SUPER_ADMIN";
  const isGroupAdmin = role === "GROUP_ADMIN";
  const isMember = role === "MEMBER";

  return {
    user,
    role,
    accessToken,
    isAuthenticated,
    isSuperAdmin,
    isGroupAdmin,
    isMember,
    login: loginMutation,
    register: registerMutation,
    logout: logoutMutation,
    profile: profileQuery,
  };
}
