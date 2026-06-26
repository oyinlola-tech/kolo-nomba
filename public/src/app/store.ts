import { create } from "zustand";
import axios from "axios";
import { setAccessToken } from "../api/client";
import type { AuthUser, UserRole } from "../types/auth.types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type ThemeMode = "light" | "dark";

interface AppState {
  user: AuthUser | null;
  role: UserRole | null;
  accessToken: string | null;
  isHydrated: boolean;
  theme: ThemeMode;
  initSession: () => void;
  setSession: (user: AuthUser, accessToken: string) => void;
  clearSession: () => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const getStoredTheme = (): ThemeMode => {
  const storedTheme = window.localStorage.getItem("kolo.theme");
  return storedTheme === "dark" ? "dark" : "light";
};

function applyTheme(theme: ThemeMode) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

applyTheme(getStoredTheme());

function parseStoredUser(): AuthUser | null {
  try {
    const raw = window.localStorage.getItem("kolo.user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  user: parseStoredUser(),
  role: parseStoredUser()?.role ?? null,
  accessToken: null,
  isHydrated: false,
  theme: getStoredTheme(),

  initSession: () => {
    const user = parseStoredUser();
    set({ user, role: user?.role ?? null });
  },

  setSession: (user, accessToken) => {
    setAccessToken(accessToken);
    window.localStorage.setItem("kolo.user", JSON.stringify(user));
    set({ user, role: user.role, accessToken, isHydrated: true });
  },

  clearSession: () => {
    setAccessToken(null);
    window.localStorage.removeItem("kolo.user");
    set({ user: null, role: null, accessToken: null, isHydrated: true });
  },

  setTheme: (theme) => {
    window.localStorage.setItem("kolo.theme", theme);
    applyTheme(theme);
    set({ theme });
  },

  toggleTheme: () => {
    const nextTheme = get().theme === "dark" ? "light" : "dark";
    get().setTheme(nextTheme);
  },
}));

export async function initAuth(): Promise<void> {
  const storedUser = parseStoredUser();
  if (!storedUser) {
    useAppStore.getState().clearSession();
    return;
  }

  try {
    const refreshRes = await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
    const newToken = refreshRes.data.accessToken ?? refreshRes.data.data?.accessToken;

    if (!newToken) {
      useAppStore.getState().clearSession();
      return;
    }

    setAccessToken(newToken);

    const profileRes = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${newToken}` },
    });
    const profile = profileRes.data.data ?? profileRes.data;

    window.localStorage.setItem("kolo.user", JSON.stringify(profile));
    useAppStore.setState({ user: profile, role: profile.role, accessToken: newToken, isHydrated: true });
  } catch {
    window.localStorage.removeItem("kolo.user");
    useAppStore.setState({ user: null, role: null, accessToken: null, isHydrated: true });
  }
}
