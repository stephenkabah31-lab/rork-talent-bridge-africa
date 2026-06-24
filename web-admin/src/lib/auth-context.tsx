import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AdminUser } from "./trpc-types";

interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string, code: string) => Promise<void>;
  verifyLogin: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

function getBaseUrl(): string {
  const url = import.meta.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  if (!url) {
    console.error("EXPO_PUBLIC_RORK_API_BASE_URL is not set");
    throw new Error("Backend URL not configured");
  }
  return url;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("admin_token");
    const savedUser = localStorage.getItem("admin_user");
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
      }
    }
    setIsLoading(false);
  }, []);

  const verifyLogin = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      try {
        const baseUrl = getBaseUrl();
        const res = await fetch(`${baseUrl}/api/trpc/auth.adminLogin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        if (!res.ok) {
          console.error("Admin login HTTP error:", res.status, res.statusText);
          return false;
        }
        const json = await res.json();
        if (json?.error) {
          console.error("Admin login tRPC error:", json.error.message);
          return false;
        }
        return json?.result?.data?.success === true;
      } catch (err) {
        console.error("Admin login request failed:", err);
        return false;
      }
    },
    [],
  );

  const login = useCallback(
    async (_username: string, _password: string, code: string) => {
      const baseUrl = getBaseUrl();
      const res = await fetch(`${baseUrl}/api/trpc/auth.adminVerify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        throw new Error(`Verification failed (${res.status})`);
      }
      const json = await res.json();

      if (json?.error || !json?.result?.data?.success) {
        throw new Error(json?.error?.message ?? "Invalid verification code");
      }

      const adminUser: AdminUser = {
        id: `admin_${Date.now()}`,
        email: "admin@talentbridge.com",
        name: "Administrator",
        type: "admin",
        isAdmin: true,
      };

      const adminToken = json.result.data.token;

      localStorage.setItem("admin_token", adminToken);
      localStorage.setItem("admin_user", JSON.stringify(adminUser));
      setUser(adminUser);
      setToken(adminToken);
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, isLoading, login, verifyLogin, logout }),
    [user, token, isLoading, login, verifyLogin, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
