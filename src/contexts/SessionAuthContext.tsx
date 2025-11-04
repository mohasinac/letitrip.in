"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  loginWithSession,
  registerWithSession,
  logoutSession,
  getCurrentSessionUser,
  type SessionUser,
} from "@/lib/auth/session-client";
import {
  StorageManager,
  CookieConsentSettings,
} from "@/lib/storage/cookieConsent";
import toast from "react-hot-toast";

// Auth user type based on SessionUser
interface AuthUser extends SessionUser {
  claims?: {
    permissions: string[];
    lastLogin?: string;
    sessionId?: string;
  };
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  cookieConsentRequired: boolean;
}

type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: AuthUser | null }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_COOKIE_CONSENT_REQUIRED"; payload: boolean }
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
  updateProfile: (updates: Partial<AuthUser>) => Promise<void>;
  handleCookieConsent: (settings: CookieConsentSettings) => void;
  setStorageItem: (key: string, value: string) => boolean;
  getStorageItem: (key: string) => string | null;
  removeStorageItem: (key: string) => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to get role-based permissions
const getRolePermissions = (role: "admin" | "seller" | "user"): string[] => {
  const permissions = {
    admin: [
      "admin:read",
      "admin:write",
      "admin:delete",
      "seller:read",
      "seller:write",
      "seller:delete",
      "user:read",
      "user:write",
      "user:delete",
      "products:manage",
      "orders:manage",
      "categories:manage",
      "users:manage",
      "analytics:view",
      "system:configure",
    ],
    seller: [
      "seller:read",
      "seller:write",
      "user:read",
      "user:write",
      "products:manage",
      "orders:view",
      "analytics:view",
    ],
    user: ["user:read", "user:write", "orders:create", "orders:view"],
  };

  return permissions[role] || permissions.user;
};

// Helper to generate session ID
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Helper to save last visited page (if not auth page)
const saveLastVisitedPageIfValid = () => {
  if (typeof window === "undefined") return;

  const currentPath = window.location.pathname;
  const authPages = ["/login", "/register", "/reset-password", "/verify-email"];
  const isAuthPage = authPages.some((page) => currentPath.startsWith(page));

  if (!isAuthPage && !currentPath.startsWith("/api/")) {
    StorageManager.setItem("last_visited_page", currentPath);
  }
};

// Helper to get redirect path based on role
const getDefaultRedirectPath = (role: "admin" | "seller" | "user"): string => {
  switch (role) {
    case "admin":
      return "/admin";
    case "seller":
      return "/seller/dashboard";
    case "user":
    default:
      return "/";
  }
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_USER":
      return { ...state, user: action.payload, loading: false, error: null };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "SET_COOKIE_CONSENT_REQUIRED":
      return { ...state, cookieConsentRequired: action.payload };
    case "LOGOUT":
      return {
        user: null,
        loading: false,
        error: null,
        cookieConsentRequired: state.cookieConsentRequired,
      };
    default:
      return state;
  }
};

export function SessionAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    loading: true,
    error: null,
    cookieConsentRequired: false,
  });

  const router = useRouter();

  // Initialize: Check cookie consent and load session
  useEffect(() => {
    const init = async () => {
      // Check cookie consent
      const required = StorageManager.isCookieConsentRequired();
      dispatch({ type: "SET_COOKIE_CONSENT_REQUIRED", payload: required });

      // Track last visited page
      saveLastVisitedPageIfValid();

      // Load current session
      await checkAuth();
    };

    init();
  }, []);

  // Check authentication status
  const checkAuth = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const sessionUser = await getCurrentSessionUser();

      if (sessionUser) {
        // Enhance session user with claims
        const userWithClaims: AuthUser = {
          ...sessionUser,
          claims: {
            permissions: getRolePermissions(sessionUser.role),
            lastLogin: new Date().toISOString(),
            sessionId: generateSessionId(),
          },
        };

        dispatch({ type: "SET_USER", payload: userWithClaims });
      } else {
        dispatch({ type: "SET_USER", payload: null });
      }
    } catch (error: any) {
      console.error("Error checking auth:", error);
      dispatch({ type: "SET_USER", payload: null });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Refresh session (useful after updates)
  const refreshSession = async () => {
    await checkAuth();
  };

  // Handle cookie consent
  const handleCookieConsent = (settings: CookieConsentSettings) => {
    dispatch({ type: "SET_COOKIE_CONSENT_REQUIRED", payload: false });
  };

  // Storage methods
  const setStorageItem = (key: string, value: string): boolean => {
    return StorageManager.setItem(key, value);
  };

  const getStorageItem = (key: string): string | null => {
    return StorageManager.getItem(key);
  };

  const removeStorageItem = (key: string): void => {
    StorageManager.removeItem(key);
  };

  // Login function using session-based auth
  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      // Login with session (returns SessionUser)
      const sessionUser = await loginWithSession(email, password);

      // Enhance with claims
      const userWithClaims: AuthUser = {
        ...sessionUser,
        claims: {
          permissions: getRolePermissions(sessionUser.role),
          lastLogin: new Date().toISOString(),
          sessionId: generateSessionId(),
        },
      };

      dispatch({ type: "SET_USER", payload: userWithClaims });

      // Determine redirect path
      let redirectPath: string;

      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const redirectParam = urlParams.get("redirect");
        const lastVisitedPage = StorageManager.getItem("last_visited_page");

        redirectPath =
          redirectParam ||
          lastVisitedPage ||
          getDefaultRedirectPath(sessionUser.role);

        // Clear stored redirect
        StorageManager.removeItem("last_visited_page");
        StorageManager.removeItem("auth_redirect_after_login");
      } else {
        redirectPath = getDefaultRedirectPath(sessionUser.role);
      }

      // Success notification
      toast.success(`Welcome back, ${sessionUser.name || sessionUser.email}!`);

      // Redirect
      router.push(redirectPath);
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage = error.message || "Login failed. Please try again.";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Register function using session-based auth
  const register = async (
    name: string,
    email: string,
    password: string,
    role: "admin" | "seller" | "user" = "user"
  ) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      // Register with session (returns SessionUser)
      const sessionUser = await registerWithSession(
        name,
        email,
        password,
        role
      );

      // Enhance with claims
      const userWithClaims: AuthUser = {
        ...sessionUser,
        claims: {
          permissions: getRolePermissions(sessionUser.role),
          lastLogin: new Date().toISOString(),
          sessionId: generateSessionId(),
        },
      };

      dispatch({ type: "SET_USER", payload: userWithClaims });

      // Determine redirect path
      let redirectPath: string;

      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const redirectParam = urlParams.get("redirect");
        const lastVisitedPage = StorageManager.getItem("last_visited_page");

        redirectPath =
          redirectParam ||
          lastVisitedPage ||
          getDefaultRedirectPath(sessionUser.role);

        // Clear stored redirect
        StorageManager.removeItem("last_visited_page");
        StorageManager.removeItem("auth_redirect_after_login");
      } else {
        redirectPath = getDefaultRedirectPath(sessionUser.role);
      }

      // Success notification
      toast.success(`Account created successfully! Welcome, ${name}!`);

      // Redirect
      router.push(redirectPath);
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage =
        error.message || "Registration failed. Please try again.";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Logout function using session-based auth
  const logout = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      // Logout (destroys session on server)
      await logoutSession();

      // Clear local state
      dispatch({ type: "LOGOUT" });

      // Success notification
      toast.success("Logged out successfully");

      // Redirect to login
      router.push("/login");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Update profile (stub - implement based on your API)
  const updateProfile = async (updates: Partial<AuthUser>) => {
    try {
      // TODO: Implement profile update API call
      // For now, just update local state
      if (state.user) {
        const updatedUser = { ...state.user, ...updates };
        dispatch({ type: "SET_USER", payload: updatedUser });
        toast.success("Profile updated successfully");
      }
    } catch (error: any) {
      console.error("Update profile error:", error);
      toast.error("Failed to update profile");
      throw error;
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    checkAuth,
    updateProfile,
    handleCookieConsent,
    setStorageItem,
    getStorageItem,
    removeStorageItem,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within SessionAuthProvider");
  }
  return context;
};

// Export for backward compatibility
export { SessionAuthProvider as AuthProvider };
