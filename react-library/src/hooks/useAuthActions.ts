/**
 * Generic Auth Actions Hook
 *
 * Framework-agnostic hook for accessing authentication actions.
 * Requires an AuthActionsContext to be provided by the consumer.
 *
 * @example
 * ```tsx
 * // In your app, create and provide context:
 * const AuthActionsContext = createContext<AuthActions | undefined>(undefined);
 *
 * // Then use the hook:
 * const { login, logout, register } = useAuthActions(AuthActionsContext);
 * ```
 */

import { Context, useContext } from "react";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  displayName?: string;
  [key: string]: any;
}

export interface AuthActions {
  /** Login with email and password */
  login: (email: string, password: string) => Promise<void>;
  /** Login with Google OAuth */
  loginWithGoogle?: () => Promise<void>;
  /** Create a new user account */
  register: (data: RegisterData) => Promise<void>;
  /** Logout current user */
  logout: () => Promise<void>;
  /** Refresh user data from server */
  refreshUser?: () => Promise<void>;
}

/**
 * Create a useAuthActions hook with a specific context
 */
export function createUseAuthActions(
  AuthActionsContext: Context<AuthActions | undefined>
) {
  return function useAuthActions(): AuthActions {
    const context = useContext(AuthActionsContext);

    if (context === undefined) {
      throw new Error(
        "useAuthActions must be used within an AuthProvider. " +
          "Make sure your component is wrapped with <AuthProvider>."
      );
    }

    return context;
  };
}

/**
 * Generic useAuthActions that accepts context as parameter
 */
export function useAuthActions<T extends AuthActions = AuthActions>(
  AuthActionsContext: Context<T | undefined>
): T {
  const context = useContext(AuthActionsContext);

  if (context === undefined) {
    throw new Error(
      "useAuthActions must be used within an AuthProvider. " +
        "Make sure your component is wrapped with <AuthProvider>."
    );
  }

  return context;
}

export default useAuthActions;
