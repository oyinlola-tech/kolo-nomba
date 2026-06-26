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
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  role: string;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await apiClient.post<{ data: LoginResponse }>("/auth/login", payload);
  return data.data;
}

export async function register(payload: RegisterPayload): Promise<LoginResponse> {
  const { data } = await apiClient.post<{ data: LoginResponse }>("/auth/register", payload);
  return data.data;
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}

export async function getProfile(): Promise<AuthUser> {
  const { data } = await apiClient.get<{ data: AuthUser }>("/auth/me");
  return data.data;
}
