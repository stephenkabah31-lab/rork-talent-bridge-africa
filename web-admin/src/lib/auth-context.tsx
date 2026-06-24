import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { trpc } from "./trpc";
import type { AdminUser } from "./trpc-types";

export interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
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

  const login = useCallback(
    async (username: string, password: string): Promise<void> => {
      // Call the real tRPC admin login endpoint (backed by Supabase)
      const result = await trpc.auth.adminLogin.mutate({
        username,
        password,
      });

      if (!result.success || !result.user) {
        throw new Error("Invalid credentials");
      }

      const adminUser: AdminUser = {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        type: "admin",
        isAdmin: true,
      };

      localStorage.setItem("admin_token", result.token);
      localStorage.setItem("admin_user", JSON.stringify(adminUser));
      setUser(adminUser);
      setToken(result.token);
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
    () => ({ user, token, isLoading, login, logout }),
    [user, token, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
