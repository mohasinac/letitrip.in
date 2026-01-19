"use client";

import { createContext } from "react";

/**
 * Auth actions context containing only authentication methods.
 * This separation allows components that only need actions
 * to avoid re-rendering when state changes.
 */
export interface AuthActions {
  /**
   * Login with email and password
   * @param email User email address
   * @param password User password
   * @param rememberMe Whether to remember the user session
   */
  login: (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<void>;

  /**
   * Login with Google ID token
   * @param idToken Google ID token from OAuth flow
   * @param userData Optional user data from Google profile
   */
  loginWithGoogle: (
    idToken: string,
    userData?: {
      displayName?: string;
      email?: string;
      photoURL?: string;
    },
  ) => Promise<void>;

  /**
   * Register a new user account
   * @param data Registration data including email, password, name, and optional role
   */
  register: (data: {
    email: string;
    password: string;
    name: string;
    role?: string;
  }) => Promise<void>;

  /**
   * Logout current user and clear session
   */
  logout: () => Promise<void>;

  /**
   * Refresh user data from server
   * Useful after profile updates or permission changes
   */
  refreshUser: () => Promise<void>;
}

export const AuthActionsContext = createContext<AuthActions | undefined>(
  undefined,
);
