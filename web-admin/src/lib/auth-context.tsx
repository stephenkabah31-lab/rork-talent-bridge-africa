import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AdminUser } from "./trpc-types";
import { trpcClient } from "./trpc";

interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string, code: string) => Promise<void>;
  verifyLogin: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

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
        // Use tRPC client for proper v11 protocol handling
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (trpcClient as any).auth.adminLogin.mutate({
          username,
          password,
        });
        return (result as { success: boolean }).success === true;
      } catch (err) {
        console.error("Admin login failed:", err);
        return false;
      }
    },
    [],
  );

  const login = useCallback(
    async (_username: string, _password: string, code: string) => {
      // Use tRPC client for proper v11 protocol handling
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (trpcClient as any).auth.adminVerify.mutate({
        code,
      });

      const data = result as {
        success: boolean;
        user: AdminUser;
        token: string;
      };

      if (!data.success || !data.token) {
        throw new Error("Invalid verification code");
      }

      const adminUser: AdminUser = {
        id: data.user?.id ?? `admin_${Date.now()}`,
        email: data.user?.email ?? "admin@talentbridge.com",
        name: data.user?.name ?? "Administrator",
        type: "admin",
        isAdmin: true,
      };

      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_user", JSON.stringify(adminUser));
      setUser(adminUser);
      setToken(data.token);
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
