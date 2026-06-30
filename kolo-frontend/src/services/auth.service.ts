import { apiClient } from "../api/client";
import type { AuthUser } from "../types/auth.types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  coopName?: string;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  role: string;
}

export interface RegisterResponse {
  userId: string;
  message: string;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await apiClient.post<{ data: LoginResponse }>("/auth/login", payload);
  return data.data;
}

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  const { data } = await apiClient.post<{ data: RegisterResponse }>("/auth/register", payload);
  return data.data;
}

export async function refreshToken(): Promise<string | null> {
  const { data } = await apiClient.post<Record<string, unknown>>("/auth/refresh", {});
  return (data.accessToken as string) ?? ((data.data as Record<string, unknown>)?.accessToken as string) ?? null;
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}

export async function getProfile(): Promise<AuthUser> {
  const { data } = await apiClient.get<{ data: AuthUser }>("/auth/me");
  return data.data;
}

export interface VerifyOtpPayload {
  userId: string;
  code: string;
}

export interface VerifyOtpResponse {
  user: AuthUser;
  accessToken: string;
  role: string;
}

export async function verifyOtp(payload: VerifyOtpPayload): Promise<VerifyOtpResponse> {
  const { data } = await apiClient.post<{ data: VerifyOtpResponse }>("/auth/verify-otp", payload);
  return data.data;
}

export async function forgotPassword(email: string): Promise<void> {
  await apiClient.post("/auth/forgot-password", { email });
}

export async function resetPassword(email: string, code: string, newPassword: string): Promise<void> {
  await apiClient.post("/auth/reset-password", { email, code, newPassword });
}

export async function resendOtp(userId: string): Promise<void> {
  await apiClient.post("/auth/resend-otp", { userId });
}
