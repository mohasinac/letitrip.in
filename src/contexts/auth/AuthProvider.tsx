"use client";

import { logError } from "@/lib/firebase-error-logger";
import { AuthResponse, authService } from "@/services/auth.service";
import { UserFE } from "@/types/frontend/user.types";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AuthActions, AuthActionsContext } from "./AuthActionsContext";
import { AuthState, AuthStateContext } from "./AuthStateContext";

interface GoogleAuthResponse extends AuthResponse {
  isNewUser: boolean;
}

/**
 * AuthProvider manages authentication state and provides both state and actions
 * through separate contexts to optimize re-renders.
 *
 * Components that only need state (e.g., displaying user info) can subscribe to
 * AuthStateContext and won't re-render when actions are called.
 *
 * Components that only need actions (e.g., login forms) can subscribe to
 * AuthActionsContext and won't re-render when state changes.
 *
 * @example
 * ```tsx
 * // In app layout
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 *
 * // In a component that needs both
 * const { user, loading } = useAuthState();
 * const { login, logout } = useAuthActions();
 * ```
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

  // Auth actions - memoized to prevent unnecessary re-renders
  const actions: AuthActions = useMemo(
    () => ({
      login: async (
        email: string,
        password: string,
        rememberMe: boolean = false
      ) => {
        try {
          const response = await authService.login({
            email,
            password,
            rememberMe,
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

      loginWithGoogle: async (
        idToken: string,
        userData?: {
          displayName?: string;
          email?: string;
          photoURL?: string;
        }
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

      register: async (data: {
        email: string;
        password: string;
        name: string;
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

      logout: async () => {
        try {
          await authService.logout();
        } catch (error: any) {
          logError(error as Error, { component: "AuthContext.logout" });
        } finally {
          setUser(null);
        }
      },

      refreshUser: async () => {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch (error: any) {
          logError(error as Error, { component: "AuthContext.refreshUser" });
          setUser(null);
        }
      },
    }),
    [] // Actions don't depend on any state, so empty dependency array is correct
  );

  // Auth state - computed from current user
  const state: AuthState = useMemo(() => {
    const isAuthenticated = !!user;
    const isAdmin = user?.isAdmin || false;
    const isSeller = user?.isSeller || false;
    const isAdminOrSeller = isAdmin || isSeller;

    return {
      user,
      loading,
      isAuthenticated,
      isAdmin,
      isSeller,
      isAdminOrSeller,
    };
  }, [user, loading]);

  return (
    <AuthStateContext.Provider value={state}>
      <AuthActionsContext.Provider value={actions}>
        {children}
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
}
