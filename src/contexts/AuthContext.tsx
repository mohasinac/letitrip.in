"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: "admin" | "seller" | "user";
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "LOGOUT" };

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role?: "admin" | "seller" | "user"
  ) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_USER":
      return { ...state, user: action.payload, loading: false, error: null };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "LOGOUT":
      return { user: null, loading: false, error: null };
    default:
      return state;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    loading: true,
    error: null,
  });

  const router = useRouter();

  // Check authentication status
  const checkAuth = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      // Check for test user first (for testing purposes)
      const testUser = localStorage.getItem("test_user");
      if (testUser) {
        try {
          const parsedTestUser = JSON.parse(testUser);
          dispatch({ type: "SET_USER", payload: parsedTestUser });
          return;
        } catch (e) {
          localStorage.removeItem("test_user");
        }
      }

      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const userData = await response.json();
        dispatch({ type: "SET_USER", payload: userData });
      } else {
        dispatch({ type: "SET_USER", payload: null });
      }
    } catch (error) {
      console.error("Auth check error:", error);
      dispatch({ type: "SET_USER", payload: null });
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      dispatch({ type: "SET_USER", payload: data.user });

      // Get the intended destination from localStorage
      const intendedPath = localStorage.getItem("auth_redirect_after_login");
      console.log("Login successful, intended path:", intendedPath);

      // Clear the stored path
      localStorage.removeItem("auth_redirect_after_login");

      // Redirect to intended page or home
      const redirectPath = intendedPath || "/";
      console.log("Redirecting to:", redirectPath);

      router.push(redirectPath);
      router.refresh();
    } catch (error: any) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    }
  };

  // Register function
  const register = async (
    name: string,
    email: string,
    password: string,
    role: "admin" | "seller" | "user" = "user"
  ) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      dispatch({ type: "SET_USER", payload: data.user });

      // Get the intended destination from localStorage or URL params
      let intendedPath = localStorage.getItem("auth_redirect_after_login");

      // Check if redirect path is in URL params (from middleware)
      const urlParams = new URLSearchParams(window.location.search);
      const redirectParam = urlParams.get("redirect");
      if (redirectParam) {
        intendedPath = redirectParam;
      }

      // Clear stored redirect paths
      localStorage.removeItem("auth_redirect_after_login");

      // Redirect to intended page or home
      router.push(intendedPath || "/");
      router.refresh();
    } catch (error: any) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      dispatch({ type: "LOGOUT" });

      // Clear any stored redirect path
      localStorage.removeItem("auth_redirect_after_login");

      // Clear cart if it exists
      localStorage.removeItem("guest_cart");

      // Clear test user if it exists
      localStorage.removeItem("test_user");

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      dispatch({ type: "LOGOUT" });
    }
  };

  // Update profile function
  const updateProfile = async (updates: Partial<User>) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Profile update failed");
      }

      // Update the user state with the new data
      if (state.user) {
        const updatedUser = { ...state.user, ...data.data };
        dispatch({ type: "SET_USER", payload: updatedUser });
      }

      // Also refresh the auth state to get the latest data
      await checkAuth();
    } catch (error: any) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    }
  };

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    checkAuth,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
