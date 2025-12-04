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

interface GoogleAuthResponse extends AuthResponse {
  isNewUser: boolean;
}

interface AuthContextType {
  user: UserFE | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  loginWithGoogle: (
    idToken: string,
    userData?: {
      displayName?: string;
      email?: string;
      photoURL?: string;
    },
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

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

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
      idToken: string,
      userData?: {
        displayName?: string;
        email?: string;
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
