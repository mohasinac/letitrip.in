"use client";

/**
 * @deprecated This file is maintained for backward compatibility only.
 * Please use the new split context hooks instead:
 *
 * - For state: `import { useAuthState } from '@/hooks/useAuthState'`
 * - For actions: `import { useAuthActions } from '@/hooks/useAuthActions'`
 * - For provider: `import { AuthProvider } from '@/contexts/auth'`
 *
 * The new split context architecture provides better performance by preventing
 * unnecessary re-renders. Components that only need state won't re-render when
 * actions are called, and components that only need actions won't re-render
 * when state changes.
 *
 * @example Migration
 * ```tsx
 * // Old way (still works, but less performant)
 * import { useAuth } from '@/contexts/AuthContext';
 * const { user, login } = useAuth();
 *
 * // New way (recommended)
 * import { useAuthState, useAuthActions } from '@/hooks/useAuth';
 * const { user } = useAuthState();
 * const { login } = useAuthActions();
 * ```
 */

import { useAuthActions, useAuthState } from "@letitrip/react-library";

// Re-export provider for backward compatibility
export { AuthProvider } from "@/contexts/auth";

// Re-export types
export type { AuthActions } from "@/contexts/auth/AuthActionsContext";
export type { AuthState } from "@/contexts/auth/AuthStateContext";

/**
 * @deprecated Use `useAuthState` and `useAuthActions` hooks instead
 * for better performance. This combined hook causes components to
 * re-render on every state OR action change.
 *
 * @example
 * ```tsx
 * // Instead of:
 * const { user, login } = useAuth();
 *
 * // Use:
 * import { useAuthState, useAuthActions } from '@/hooks/useAuth';
 * const { user } = useAuthState();
 * const { login } = useAuthActions();
 * ```
 */
export function useAuth() {
  const state = useAuthState();
  const actions = useAuthActions();

  return {
    ...state,
    ...actions,
  };
}

// Legacy context export for type compatibility
// Not recommended for direct use
import type { AuthResponse } from "@/services/auth.service";
import type { UserFE } from "@/types/frontend/user.types";
import { createContext } from "react";

interface GoogleAuthResponse extends AuthResponse {
  isNewUser: boolean;
}

interface AuthContextType {
  user: UserFE | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<AuthResponse>;
  loginWithGoogle: (
    idToken: string,
    userData?: {
      displayName?: string;
      email?: string;
      photoURL?: string;
    }
  ) => Promise<GoogleAuthResponse>;
  register: (data: {
    email: string;
    password: string;
    name: string;
    role?: string;
  }) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isSeller: boolean;
  isAdminOrSeller: boolean;
}

/**
 * @deprecated Use AuthStateContext and AuthActionsContext instead
 */
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
