"use client";

import { UserFE } from "@/types/frontend/user.types";
import { createContext } from "react";

/**
 * Auth state context containing only read-only state values.
 * This separation allows components that only read auth state
 * to avoid re-rendering when actions are called.
 */
export interface AuthState {
  /** Current authenticated user, null if not authenticated */
  user: UserFE | null;

  /** Whether auth state is being initialized */
  loading: boolean;

  /** Whether a user is currently authenticated */
  isAuthenticated: boolean;

  /** Whether the current user is an admin */
  isAdmin: boolean;

  /** Whether the current user is a seller */
  isSeller: boolean;

  /** Whether the current user is an admin or seller */
  isAdminOrSeller: boolean;
}

export const AuthStateContext = createContext<AuthState | undefined>(undefined);
