import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { trpc } from "./trpc";
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

// Keys mirror the Expo app pattern so data is consistent
const STORAGE_KEY = "talentbridge_user";
const TOKEN_KEY = "talentbridge_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(STORAGE_KEY);
    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsed);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // ── Regular user login ──────────────────────────────────────
  const login = useCallback(
    async (email: string, password: string, userType: UserType): Promise<void> => {
      const result = await trpc.auth.login.mutate({
        email: email.toLowerCase().trim(),
        password,
        userType: userType as "professional" | "recruiter" | "company",
      });

      if (!result.success || !result.user) {
        throw new Error("Invalid credentials");
      }

      const appUser: User = {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        type: result.user.type as User["type"],
        fullName: (result.user as Record<string, string>).fullName,
        companyName: (result.user as Record<string, string>).companyName,
        phoneNumber: (result.user as Record<string, string>).phoneNumber,
        country: (result.user as Record<string, string>).country,
        isPremium: (result.user as Record<string, boolean>).isPremium ?? false,
        isAdmin: (result.user as Record<string, boolean>).isAdmin ?? false,
      };

      localStorage.setItem(TOKEN_KEY, result.token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appUser));
      setUser(appUser);
      setToken(result.token);
    },
    [],
  );

  // ── Admin login ─────────────────────────────────────────────
  const adminLogin = useCallback(
    async (username: string, password: string): Promise<void> => {
      const result = await trpc.auth.adminLogin.mutate({ username, password });

      if (!result.success || !result.user) {
        throw new Error("Invalid credentials");
      }

      const adminUser: User = {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        type: "admin",
        isAdmin: true,
        isPremium: false,
      };

      localStorage.setItem(TOKEN_KEY, result.token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(adminUser));
      setUser(adminUser);
      setToken(result.token);
    },
    [],
  );

  // ── Signup ──────────────────────────────────────────────────
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
      const result = await trpc.auth.signup.mutate({
        email: data.email.toLowerCase().trim(),
        password: data.password,
        userType: data.userType as "professional" | "recruiter" | "company",
        fullName: data.fullName,
        companyName: data.companyName,
        phoneNumber: data.phoneNumber,
        country: data.country,
      });

      if (!result.success || !result.user) {
        throw new Error("Signup failed");
      }

      const appUser: User = {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        type: result.user.type as User["type"],
        fullName: (result.user as Record<string, string>).fullName,
        companyName: (result.user as Record<string, string>).companyName,
        phoneNumber: (result.user as Record<string, string>).phoneNumber,
        country: (result.user as Record<string, string>).country,
        isPremium: (result.user as Record<string, boolean>).isPremium ?? false,
        isAdmin: false,
      };

      localStorage.setItem(TOKEN_KEY, result.token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appUser));
      setUser(appUser);
      setToken(result.token);
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
