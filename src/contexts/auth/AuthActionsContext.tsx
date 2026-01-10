"use client";

import { AuthResponse } from "@/services/auth.service";
import { createContext } from "react";

interface GoogleAuthResponse extends AuthResponse {
  isNewUser: boolean;
}

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
   * @returns Authentication response with user data and token
   */
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<AuthResponse>;

  /**
   * Login with Google ID token
   * @param idToken Google ID token from OAuth flow
   * @param userData Optional user data from Google profile
   * @returns Authentication response with user data and flag indicating if user is new
   */
  loginWithGoogle: (
    idToken: string,
    userData?: {
      displayName?: string;
      email?: string;
      photoURL?: string;
    }
  ) => Promise<GoogleAuthResponse>;

  /**
   * Register a new user account
   * @param data Registration data including email, password, name, and optional role
   * @returns Authentication response with newly created user data and token
   */
  register: (data: {
    email: string;
    password: string;
    name: string;
    role?: string;
  }) => Promise<AuthResponse>;

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
  undefined
);
