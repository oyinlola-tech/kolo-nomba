import { apiClient } from "../api/client";
import type { AuthUser, UserRole } from "../types/auth.types";

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

export interface LoginSuccess {
  user: AuthUser;
  accessToken: string;
  role: UserRole;
}

export interface LoginChallenge {
  challengeId: string;
  email: string;
  type: "login_challenge";
}

export type LoginResponse = LoginSuccess | LoginChallenge;

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

function hasAccessToken(obj: unknown): obj is { accessToken: string } {
  return typeof obj === "object" && obj !== null && "accessToken" in obj && typeof (obj as Record<string, unknown>).accessToken === "string";
}

export async function refreshToken(): Promise<string | null> {
  const { data } = await apiClient.post<{ data: { accessToken: string } } | { accessToken: string }>("/auth/refresh", {});
  if (hasAccessToken(data)) return data.accessToken;
  if (hasAccessToken(data.data)) return data.data.accessToken;
  return null;
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}

export async function updateProfile(payload: Partial<Pick<AuthUser, "firstName" | "lastName" | "phone" | "email">>): Promise<AuthUser> {
  const { data } = await apiClient.patch<{ data: AuthUser }>("/auth/me", payload);
  return data.data;
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
  role: UserRole;
}

export async function verifyOtp(payload: VerifyOtpPayload): Promise<VerifyOtpResponse> {
  const { data } = await apiClient.post<{ data: VerifyOtpResponse }>("/auth/verify-otp", payload);
  return data.data;
}

export async function verifyLoginOtp(challengeId: string, code: string): Promise<LoginSuccess> {
  const { data } = await apiClient.post<{ data: LoginSuccess }>("/auth/verify-login-otp", { challengeId, code });
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
