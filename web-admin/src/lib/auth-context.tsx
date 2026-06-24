import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "./trpc-types";

export type UserType = "professional" | "recruiter" | "company" | "admin";

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string, userType: UserType) => Promise<void>;
  adminLogin: (username: string, password: string) => Promise<void>;
  signup: (data: {
    email: string;
    password: string;
    userType: UserType;
    fullName?: string;
    companyName?: string;
    phoneNumber?: string;
    country?: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

const STORAGE_KEY = "talentbridge_user";
const TOKEN_KEY = "talentbridge_token";

function getApiBase(): string {
  if (import.meta.env.DEV) return "";
  return import.meta.env.EXPO_PUBLIC_RORK_FUNCTIONS_URL ?? "https://hire-me-africa-backend.rork.app";
}

interface AuthResponse {
  success: boolean;
  message?: string;
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    type: string;
    fullName?: string;
    companyName?: string;
    phoneNumber?: string;
    country?: string;
    isPremium?: boolean;
    isAdmin?: boolean;
  };
}

async function apiFetch(path: string, body: Record<string, unknown>): Promise<AuthResponse> {
  const res = await fetch(`${getApiBase()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as AuthResponse;
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Request failed");
  }
  return json;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(STORAGE_KEY);
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // ── Regular user login (REST) ──
  const login = useCallback(
    async (email: string, password: string, userType: UserType): Promise<void> => {
      const result = await apiFetch("/api/auth/login", {
        email: email.toLowerCase().trim(),
        password,
        userType,
      });

      const appUser: User = {
        id: result.user.id as string,
        email: result.user.email as string,
        name: result.user.name as string,
        type: result.user.type as User["type"],
        fullName: result.user.fullName as string | undefined,
        companyName: result.user.companyName as string | undefined,
        phoneNumber: result.user.phoneNumber as string | undefined,
        country: result.user.country as string | undefined,
        isPremium: (result.user.isPremium as boolean) ?? false,
        isAdmin: (result.user.isAdmin as boolean) ?? false,
      };

      localStorage.setItem(TOKEN_KEY, result.token as string);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appUser));
      setUser(appUser);
      setToken(result.token as string);
    },
    [],
  );

  // ── Admin login (REST) ──
  const adminLogin = useCallback(
    async (username: string, password: string): Promise<void> => {
      const result = await apiFetch("/api/auth/admin-login", { username, password });

      const adminUser: User = {
        id: result.user.id as string,
        email: result.user.email as string,
        name: result.user.name as string,
        type: "admin",
        isAdmin: true,
        isPremium: false,
      };

      localStorage.setItem(TOKEN_KEY, result.token as string);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(adminUser));
      setUser(adminUser);
      setToken(result.token as string);
    },
    [],
  );

  // ── Signup (REST) ──
  const signup = useCallback(
    async (data: {
      email: string;
      password: string;
      userType: UserType;
      fullName?: string;
      companyName?: string;
      phoneNumber?: string;
      country?: string;
    }): Promise<void> => {
      const result = await apiFetch("/api/auth/signup", {
        email: data.email.toLowerCase().trim(),
        password: data.password,
        userType: data.userType,
        fullName: data.fullName,
        companyName: data.companyName,
        phoneNumber: data.phoneNumber,
        country: data.country,
      });

      const appUser: User = {
        id: result.user.id as string,
        email: result.user.email as string,
        name: result.user.name as string,
        type: result.user.type as User["type"],
        fullName: result.user.fullName as string | undefined,
        companyName: result.user.companyName as string | undefined,
        phoneNumber: result.user.phoneNumber as string | undefined,
        country: result.user.country as string | undefined,
        isPremium: (result.user.isPremium as boolean) ?? false,
        isAdmin: false,
      };

      localStorage.setItem(TOKEN_KEY, result.token as string);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appUser));
      setUser(appUser);
      setToken(result.token as string);
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, isLoading, login, adminLogin, signup, logout }),
    [user, token, isLoading, login, adminLogin, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
