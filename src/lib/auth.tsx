import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type User = { email: string; name: string } | null;

type AuthCtx = {
  user: User;
  login: (email: string, password: string) => void;
  logout: () => void;
};

const Ctx = createContext<AuthCtx>({ user: null, login: () => {}, logout: () => {} });

const KEY = "ezk_demo_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = sessionStorage.getItem(KEY);
    if (raw) setUser(JSON.parse(raw));
  }, []);

  const login = (email: string, _pw: string) => {
    const u = { email, name: email.split("@")[0].replace(/\W/g, " ") || "Admin" };
    sessionStorage.setItem(KEY, JSON.stringify(u));
    setUser(u);
  };
  const logout = () => {
    sessionStorage.removeItem(KEY);
    setUser(null);
  };

  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
