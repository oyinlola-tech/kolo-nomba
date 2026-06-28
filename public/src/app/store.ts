import { create } from "zustand";
import { setAccessToken } from "../api/client";
import { getProfile, refreshToken } from "../services/auth.service";
import type { AuthUser, UserRole } from "../types/auth.types";

type ThemeMode = "light" | "dark";

interface AppState {
  user: AuthUser | null;
  role: UserRole | null;
  accessToken: string | null;
  isHydrated: boolean;
  theme: ThemeMode;
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

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  role: null,
  accessToken: null,
  isHydrated: false,
  theme: getStoredTheme(),

  setSession: (user, accessToken) => {
    setAccessToken(accessToken);
    set({ user, role: user.role, accessToken, isHydrated: true });
  },

  clearSession: () => {
    setAccessToken(null);
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
  try {
    const newToken = await refreshToken();

    if (!newToken) {
      useAppStore.setState({ user: null, role: null, accessToken: null, isHydrated: true });
      return;
    }

    setAccessToken(newToken);

    const profile = await getProfile();

    useAppStore.setState({ user: profile, role: profile.role, accessToken: newToken, isHydrated: true });
  } catch {
    useAppStore.setState({ user: null, role: null, accessToken: null, isHydrated: true });
  }
}
