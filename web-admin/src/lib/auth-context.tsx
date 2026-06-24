import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AdminUser } from "./trpc-types";

export interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

// Hardcoded dev credentials — backend deployment is pending.
// Once the backend is live, these can be removed and the tRPC login restored.
const DEV_CREDENTIALS: Record<string, { password: string; name: string }> = {
  admin: { password: "admin123", name: "Administrator" },
  "bridge.gh": { password: "bridge123", name: "Bridge Admin" },
};

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
      // Client-side credential check — backend not yet deployed.
      const entry = DEV_CREDENTIALS[username];
      if (!entry || entry.password !== password) {
        throw new Error("Invalid credentials");
      }

      const token = `admin_token_dev_${Date.now()}`;
      const adminUser: AdminUser = {
        id: `admin_${username}`,
        email: `${username}@talentbridge.com`,
        name: entry.name,
        type: "admin",
        isAdmin: true,
      };

      localStorage.setItem("admin_token", token);
      localStorage.setItem("admin_user", JSON.stringify(adminUser));
      setUser(adminUser);
      setToken(token);
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
