"use client";

import { logError } from "@/lib/firebase-error-logger";
import { AuthResponse, authService } from "@/services/auth.service";
import { UserFE } from "@/types/frontend/user.types";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
 * Enhanced with:
 * - Automatic token refresh with retry logic
 * - Background token refresh before expiration
 * - Exponential backoff for failed refreshes
 * - Graceful handling of token expiration
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

  // Token refresh state
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const baseRetryDelay = 1000; // 1 second
  const tokenRefreshInterval = 50 * 60 * 1000; // 50 minutes (Firebase tokens expire after 1 hour)

  /**
   * Clear the token refresh timer
   */
  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  /**
   * Refresh user token with retry logic
   */
  const refreshUserWithRetry = useCallback(
    async (isBackgroundRefresh = false): Promise<boolean> => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        retryCountRef.current = 0; // Reset retry count on success

        if (!isBackgroundRefresh) {
          console.log("Token refreshed successfully");
        }

        return true;
      } catch (error: any) {
        logError(error as Error, {
          component: "AuthContext.refreshUserWithRetry",
          isBackgroundRefresh,
          retryCount: retryCountRef.current,
        });

        // Retry with exponential backoff
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          const delay = baseRetryDelay * Math.pow(2, retryCountRef.current - 1);

          console.log(
            `Token refresh failed, retrying in ${delay}ms (attempt ${retryCountRef.current}/${maxRetries})`
          );

          await new Promise((resolve) => setTimeout(resolve, delay));
          return refreshUserWithRetry(isBackgroundRefresh);
        } else {
          // Max retries exceeded, log out user
          console.error(
            "Token refresh failed after max retries, logging out user"
          );
          setUser(null);
          retryCountRef.current = 0;
          return false;
        }
      }
    },
    []
  );

  /**
   * Schedule next token refresh
   */
  const scheduleTokenRefresh = useCallback(() => {
    clearRefreshTimer();

    // Schedule refresh 10 minutes before expiration (at 50 minutes)
    refreshTimerRef.current = setTimeout(async () => {
      if (user) {
        console.log("Starting background token refresh");
        const success = await refreshUserWithRetry(true);

        if (success) {
          // Schedule next refresh
          scheduleTokenRefresh();
        }
      }
    }, tokenRefreshInterval);
  }, [user, clearRefreshTimer, refreshUserWithRetry, tokenRefreshInterval]);

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
      } else if (currentUser) {
        // User authenticated, schedule background token refresh
        scheduleTokenRefresh();
      }
    } catch (error: any) {
      logError(error as Error, { component: "AuthContext.initializeAuth" });
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [scheduleTokenRefresh]);

  useEffect(() => {
    initializeAuth();

    // Cleanup on unmount
    return () => {
      clearRefreshTimer();
    };
  }, [initializeAuth, clearRefreshTimer]);

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

          // Schedule background token refresh
          scheduleTokenRefresh();

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

          // Schedule background token refresh
          scheduleTokenRefresh();

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

          // Schedule background token refresh
          scheduleTokenRefresh();

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
          clearRefreshTimer();
        }
      },

      refreshUser: async () => {
        return refreshUserWithRetry(false);
      },
    }),
    [scheduleTokenRefresh, clearRefreshTimer, refreshUserWithRetry]
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
