export type UserRole = "SUPER_ADMIN" | "GROUP_ADMIN" | "GROUP_OWNER" | "MEMBER";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: string;
}

export interface AuthTokens {
  accessToken: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
}

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
