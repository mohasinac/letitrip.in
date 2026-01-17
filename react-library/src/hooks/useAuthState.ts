"use client";

/**
 * Generic Auth State Hook
 *
 * Framework-agnostic hook for accessing authentication state.
 * Requires an AuthContext to be provided by the consumer.
 *
 * @example
 * ```tsx
 * // In your app, create and provide context:
 * const AuthContext = createContext<AuthState | undefined>(undefined);
 *
 * // Then use the hook:
 * const { user, loading, isAuthenticated } = useAuthState(AuthContext);
 * ```
 */

import { Context, useContext } from "react";

export interface User {
  id: string;
  email: string;
  displayName?: string;
  [key: string]: any;
}

export interface AuthState {
  /** Current authenticated user or null */
  user: User | null;
  /** Whether auth state is being initialized */
  loading: boolean;
  /** Whether a user is logged in */
  isAuthenticated: boolean;
  /** Whether current user is an admin */
  isAdmin?: boolean;
  /** Whether current user is a seller */
  isSeller?: boolean;
  /** Whether current user is admin or seller */
  isAdminOrSeller?: boolean;
}

/**
 * Create a useAuthState hook with a specific context
 */
export function createUseAuthState(
  AuthContext: Context<AuthState | undefined>
) {
  return function useAuthState(): AuthState {
    const context = useContext(AuthContext);

    if (context === undefined) {
      throw new Error(
        "useAuthState must be used within an AuthProvider. " +
          "Make sure your component is wrapped with <AuthProvider>."
      );
    }

    return context;
  };
}

/**
 * Generic useAuthState that accepts context as parameter
 */
export function useAuthState<T extends AuthState = AuthState>(
  AuthContext: Context<T | undefined>
): T {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      "useAuthState must be used within an AuthProvider. " +
        "Make sure your component is wrapped with <AuthProvider>."
    );
  }

  return context;
}

export default useAuthState;
