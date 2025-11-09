"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { authService, User, AuthResponse } from "@/services/auth.service";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    try {
      // First, try to get cached user for immediate UI update
      const cachedUser = authService.getCachedUser();
      if (cachedUser) {
        setUser(cachedUser);
      }

      // Then validate with server
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Auth initialization error:", error);
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
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  }, []);

  // Refresh user from server
  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Refresh user error:", error);
      setUser(null);
    }
  }, []);

  // Computed values
  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";
  const isSeller = user?.role === "seller";
  const isAdminOrSeller = isAdmin || isSeller;

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    login,
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
