import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Role, User } from "../types";
import { login as loginService, register as registerService } from "../services/api";

type SafeUser = Omit<User, "password">;

type AuthContextValue = {
  user: SafeUser | null;
  token: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<SafeUser>;
  register: (payload: { fullName: string; email: string; phone: string; password: string }) => Promise<SafeUser>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const readStoredSession = () => {
  const raw = localStorage.getItem("aio-auth");
  if (!raw) return { user: null, token: null, refreshToken: null };
  try {
    return JSON.parse(raw) as { user: SafeUser; token: string; refreshToken?: string };
  } catch {
    return { user: null, token: null, refreshToken: null };
  }
};

export const roleHome: Record<Role, string> = {
  paciente: "/minha-conta",
  profissional: "/profissional",
  recepcao: "/recepcao",
  admin: "/admin",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const stored = readStoredSession();
  const [user, setUser] = useState<SafeUser | null>(stored.user);
  const [token, setToken] = useState<string | null>(stored.token);
  const [refreshToken, setRefreshToken] = useState<string | null>(stored.refreshToken ?? null);

  const persist = (nextUser: SafeUser, nextToken: string, nextRefreshToken?: string) => {
    setUser(nextUser);
    setToken(nextToken);
    setRefreshToken(nextRefreshToken ?? null);
    localStorage.setItem("aio-auth", JSON.stringify({ user: nextUser, token: nextToken, refreshToken: nextRefreshToken }));
  };

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginService(email, password);
    persist(response.user, response.token, response.refreshToken);
    return response.user;
  }, []);

  const register = useCallback(async (payload: { fullName: string; email: string; phone: string; password: string }) => {
    const response = await registerService(payload);
    persist(response.user, response.token, response.refreshToken);
    return response.user;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem("aio-auth");
  }, []);

  const value = useMemo(
    () => ({ user, token, refreshToken, login, register, logout, isAuthenticated: Boolean(user && token) }),
    [user, token, refreshToken, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
};
