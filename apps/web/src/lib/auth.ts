"use client";

import { createContext, useContext } from "react";
import type { User } from "./types";

export const TOKEN_KEY = "deus_token";

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  /** True until the initial token validation completes. */
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
