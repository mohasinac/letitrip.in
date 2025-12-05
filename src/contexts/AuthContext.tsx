/**
 * @fileoverview React Component
 * @module src/contexts/AuthContext
 * @description This file contains the AuthContext component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { authService, AuthResponse } from "@/services/auth.service";
import { UserFE } from "@/types/frontend/user.types";
import { logError } from "@/lib/firebase-error-logger";

/**
 * GoogleAuthResponse interface
 * 
 * @interface
 * @description Defines the structure and contract for GoogleAuthResponse
 */
interface GoogleAuthResponse extends AuthResponse {
  /** Is New User */
  isNewUser: boolean;
}

/**
 * AuthContextType interface
 * 
 * @interface
 * @description Defines the structure and contract for AuthContextType
 */
interface AuthContextType {
  /** User */
  user: UserFE | null;
  /** Loading */
  loading: boolean;
  /** Is Authenticated */
  isAuthenticated: boolean;
  /** Login */
  login: (email: string, password: string) => Promise<AuthResponse>;
  /** Login With Google */
  loginWithGoogle: (
    /** Id Token */
    idToken: string,
    /** User Data */
    userData?: {
      /** Display Name */
      displayName?: string;
      /** Email */
      email?: string;
      /** Photo U R L */
      photoURL?: string;
    },
  ) => Promise<GoogleAuthResponse>;
  /** Register */
  register: (data: {
    /** Email */
    email: string;
    /** Password */
    password: string;
    /** Name */
    name: string;
    /** Role */
    role?: string;
  }) => Promise<AuthResponse>;
  /** Logout */
  logout: () => Promise<void>;
  /** Refresh User */
  refreshUser: () => Promise<void>;
  /** Is Admin */
  isAdmin: boolean;
  /** Is Seller */
  isSeller: boolean;
  /** Is Admin Or Seller */
  isAdminOrSeller: boolean;
}

/**
 * A
 * @constant
 */
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

/**
 * Function: Auth Provider
 */
/**
 * Performs auth provider operation
 *
 * @param {{ children} { children } - The { children }
 *
 * @returns {any} The authprovider result
 *
 * @example
 * AuthProvider({});
 */

/**
 * Performs auth provider operation
 *
 * @param {{ children} { children } - The { children }
 *
 * @returns {any} The authprovider result
 *
 * @example
 * AuthProvider({});
 */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserFE | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    try {
      // First, try to get cached user for immediate UI update
      const cachedUser = authService.getCachedUser();
      if (cachedUser) {
        setUser(cachedUser);
        setLoading(false); // Show UI immediately with cached user
      }

      // Then validate with server (silently)
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);

      if (!currentUser && cachedUser) {
        // Session expired, cached user cleared automatically by authService
      }
    } catch (error: any) {
      logError(error as Error, { component: "AuthContext.initializeAuth" });
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      // Immediately set user state with the response
      setUser(response.user);
      setLoading(false);
      return response;
    } catch (error) {
      setUser(null);
      setLoading(false);
      throw error;
    }
  }, []);

  // Google Login function
  const loginWithGoogle = useCallback(
    async (
      /** Id Token */
      idToken: string,
      /** User Data */
      userData?: {
        /** Display Name */
        displayName?: string;
        /** Email */
        email?: string;
        /** Photo U R L */
        photoURL?: string;
      },
    ) => {
      try {
        const response = await authService.loginWithGoogle({
          idToken,
          userData,
        });
        // Immediately set user state with the response
        setUser(response.user);
        setLoading(false);
        return response;
      } catch (error) {
        setUser(null);
        setLoading(false);
        throw error;
      }
    },
    [],
  );

  // Register function
  const register = useCallback(
    async (data: {
      /** Email */
      email: string;
      /** Password */
      password: string;
      /** Name */
      name: string;
      /** Role */
      role?: string;
    }) => {
      try {
        const response = await authService.register(data);
        // Immediately set user state with the response
        setUser(response.user);
        setLoading(false);
        return response;
      } catch (error) {
        setUser(null);
        setLoading(false);
        throw error;
      }
    },
    [],
  );

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error: any) {
      logError(error as Error, { component: "AuthContext.logout" });
    } finally {
      setUser(null);
    }
  }, []);

  // Refresh user from server
  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error: any) {
      logError(error as Error, { component: "AuthContext.refreshUser" });
      setUser(null);
    }
  }, []);

  // Computed values (UserFE already has these as boolean fields)
  const isAuthenticated = !!user;
  const isAdmin = user?.isAdmin || false;
  const isSeller = user?.isSeller || false;
  const isAdminOrSeller = isAdmin || isSeller;

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    login,
    loginWithGoogle,
    register,
    logout,
    refreshUser,
    isAdmin,
    isSeller,
    isAdminOrSeller,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Function: Use Auth
 */
/**
 * Custom React hook for auth
 *
 * @returns {any} The useauth result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * useAuth();
 */

/**
 * Custom React hook for auth
 *
 * @returns {any} The useauth result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * useAuth();
 */

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
