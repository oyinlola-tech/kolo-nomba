import { useMutation, useQuery } from "@tanstack/react-query";
import { useAppStore } from "../app/store";
import { getAccessToken } from "../api/client";
import * as authService from "../services/auth.service";
import type { LoginPayload, RegisterPayload } from "../services/auth.service";
import type { AuthUser, UserRole } from "../types/auth.types";

export function useAuth() {
  const user = useAppStore((state) => state.user);
  const role = useAppStore((state) => state.role);
  const accessToken = useAppStore((state) => state.accessToken);
  const setSession = useAppStore((state) => state.setSession);
  const clearSession = useAppStore((state) => state.clearSession);

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (result) => {
      setSession(result.user as AuthUser, result.accessToken);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: (result) => {
      setSession(result.user as AuthUser, result.accessToken);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSettled: () => clearSession(),
  });

  const profileQuery = useQuery({
    queryKey: ["auth", "profile"],
    queryFn: authService.getProfile,
    enabled: !!accessToken,
    retry: false,
    onSuccess: (userData: AuthUser) => {
      const token = getAccessToken() ?? "";
      setSession(userData, token);
    },
  } as never);

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
