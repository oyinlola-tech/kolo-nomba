import { useMutation } from "@tanstack/react-query";
import { forgotPassword, resetPassword } from "../services/auth.service";

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => forgotPassword(email),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (params: { email: string; code: string; newPassword: string }) =>
      resetPassword(params.email, params.code, params.newPassword),
  });
}
