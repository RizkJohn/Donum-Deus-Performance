"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  login as apiLogin,
  me as apiMe,
  register as apiRegister,
} from "@/lib/api";
import { AuthContext, TOKEN_KEY, type AuthContextValue } from "@/lib/auth";
import type { User } from "@/lib/types";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: if a token exists, validate it; clear it on 401/failure.
  useEffect(() => {
    let active = true;
    const stored =
      typeof window !== "undefined"
        ? window.localStorage.getItem(TOKEN_KEY)
        : null;
    if (!stored) {
      setLoading(false);
      return;
    }
    apiMe(stored)
      .then((u) => {
        if (!active) return;
        setToken(stored);
        setUser(u);
      })
      .catch(() => {
        if (!active) return;
        window.localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback((nextToken: string, nextUser: User) => {
    window.localStorage.setItem(TOKEN_KEY, nextToken);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await apiLogin(email, password);
      persist(res.token, res.user);
    },
    [persist]
  );

  const register = useCallback(
    async (email: string, password: string) => {
      const res = await apiRegister(email, password);
      persist(res.token, res.user);
    },
    [persist]
  );

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
