"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  StorageManager,
  CookieConsentSettings,
} from "@/lib/storage/cookieConsent";
import { User } from "@/types";

// Extend the base User type with authentication-specific claims
interface AuthUser extends User {
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
      "products:create",
      "products:update",
      "products:read",
      "orders:read",
      "orders:update",
      "analytics:view",
    ],
    user: [
      "user:read",
      "user:write",
      "products:read",
      "orders:create",
      "orders:read",
      "cart:manage",
      "profile:update",
    ],
  };

  return permissions[role] || permissions.user;
};

// Helper function to generate session ID
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Helper function to validate redirect paths for security
const isValidRedirectPath = (path: string): boolean => {
  try {
    // Must be relative path (no external redirects)
    if (path.startsWith("http") || path.startsWith("//")) {
      return false;
    }

    // Must start with /
    if (!path.startsWith("/")) {
      return false;
    }

    // Avoid infinite loops
    const authPaths = ["/login", "/register", "/logout"];
    if (authPaths.some((authPath) => path.startsWith(authPath))) {
      return false;
    }

    // Basic path validation
    return path.length < 500 && !/[<>"]/.test(path);
  } catch {
    return false;
  }
};

// Helper function to get default redirect based on user role
const getDefaultRedirectForRole = (
  role?: "admin" | "seller" | "user"
): string => {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    loading: true,
    error: null,
    cookieConsentRequired: false,
  });

  const router = useRouter();

  // Initialize storage and cookie consent checking
  useEffect(() => {
    const checkCookieConsent = () => {
      const required = StorageManager.isCookieConsentRequired();
      dispatch({ type: "SET_COOKIE_CONSENT_REQUIRED", payload: required });
    };

    checkCookieConsent();
  }, []);

  // Handle cookie consent given
  const handleCookieConsent = (settings: CookieConsentSettings) => {
    dispatch({ type: "SET_COOKIE_CONSENT_REQUIRED", payload: false });

    // If preferences cookies are now allowed, migrate any pending auth data
    if (settings.preferences) {
      const pendingRedirect = StorageManager.getItem(
        "auth_redirect_after_login"
      );
      if (pendingRedirect) {
        // Data is now properly stored, no need to do anything special
      }
    }
  };

  // Enhanced storage methods
  const setStorageItem = (key: string, value: string): boolean => {
    return StorageManager.setItem(key, value);
  };

  const getStorageItem = (key: string): string | null => {
    return StorageManager.getItem(key);
  };

  const removeStorageItem = (key: string): void => {
    StorageManager.removeItem(key);
  };

  // Check authentication status with enhanced claims validation
  const checkAuth = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      // Check for test user first (for testing purposes in development)
      if (typeof window !== "undefined") {
        const testUser = getStorageItem("test_user");
        if (testUser) {
          try {
            const parsedTestUser = JSON.parse(testUser);
            // Add enhanced claims for test users
            const userWithClaims = {
              ...parsedTestUser,
              claims: {
                permissions: getRolePermissions(parsedTestUser.role),
                lastLogin: new Date().toISOString(),
                sessionId: generateSessionId(),
              },
            };
            dispatch({ type: "SET_USER", payload: userWithClaims });
            return;
          } catch (e) {
            removeStorageItem("test_user");
          }
        }
      }

      // Check server-side authentication
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store", // Ensure fresh data
      });

      console.log("Auth check response:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("Auth check result:", result);
        if (result.success && result.data) {
          // Enhance user data with claims if not present
          const userData = result.data;
          if (!userData.claims) {
            userData.claims = {
              permissions: getRolePermissions(userData.role),
              lastLogin: new Date().toISOString(),
              sessionId: generateSessionId(),
            };
          }
          console.log("Setting authenticated user:", userData);
          dispatch({ type: "SET_USER", payload: userData });
        } else {
          console.log("Auth check failed: no user data");
          dispatch({ type: "SET_USER", payload: null });
        }
      } else if (response.status === 401) {
        // Unauthorized - clear any stale auth state
        console.log("Auth check failed: unauthorized");
        dispatch({ type: "SET_USER", payload: null });
      } else {
        // Other errors - might be network issues, don't clear auth state
        console.log("Auth check failed: network error", response.status);
        dispatch({ type: "SET_LOADING", payload: false });
      }
    } catch (error) {
      console.error("Auth check error:", error);
      // Network errors shouldn't clear auth state, just stop loading
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Enhanced login function with better claims and redirect handling
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

      // Server returns user data, enhance it with claims
      if (data.success && data.data?.user) {
        const userData = data.data.user;
        const userWithClaims = {
          ...userData,
          claims: {
            permissions: getRolePermissions(userData.role),
            lastLogin: new Date().toISOString(),
            sessionId: generateSessionId(),
          },
        };

        dispatch({ type: "SET_USER", payload: userWithClaims });
      } else {
        throw new Error("Invalid response format");
      }

      // Get the intended destination with enhanced storage fallback
      let intendedPath: string | null = null;

      if (typeof window !== "undefined") {
        // Try multiple sources for redirect path
        intendedPath =
          getStorageItem("auth_redirect_after_login") ||
          new URLSearchParams(window.location.search).get("redirect") ||
          (document.referrer &&
          !document.referrer.includes("/login") &&
          !document.referrer.includes("/register")
            ? new URL(document.referrer).pathname
            : null);
      }

      // Clear the stored path
      removeStorageItem("auth_redirect_after_login");

      // Determine final redirect path
      let redirectPath = "/";

      if (intendedPath) {
        // Validate redirect path for security
        if (isValidRedirectPath(intendedPath)) {
          redirectPath = intendedPath;
        }
      } else {
        // Role-based default redirects
        const role = data.data?.user?.role;
        redirectPath = getDefaultRedirectForRole(role);
      }

      // Store successful login info if storage is available
      if (setStorageItem("last_successful_login", new Date().toISOString())) {
        setStorageItem("last_login_role", data.data.user.role);
      }

      router.push(redirectPath);
      router.refresh();
    } catch (error: any) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    }
  };

  // Enhanced register function with better claims and redirect handling
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

      // Server returns user data, enhance it with claims
      if (data.success && data.data?.user) {
        const userData = data.data.user;
        const userWithClaims = {
          ...userData,
          claims: {
            permissions: getRolePermissions(userData.role),
            lastLogin: new Date().toISOString(),
            sessionId: generateSessionId(),
          },
        };

        dispatch({ type: "SET_USER", payload: userWithClaims });
      } else {
        throw new Error("Invalid response format");
      }

      // Enhanced redirect logic similar to login
      let intendedPath: string | null = null;

      if (typeof window !== "undefined") {
        // Try multiple sources for redirect path
        intendedPath =
          getStorageItem("auth_redirect_after_login") ||
          new URLSearchParams(window.location.search).get("redirect");
      }

      // Clear stored redirect paths
      removeStorageItem("auth_redirect_after_login");

      // Determine final redirect path
      let redirectPath = "/";

      if (intendedPath && isValidRedirectPath(intendedPath)) {
        redirectPath = intendedPath;
      } else {
        // For new registrations, show role-specific onboarding or dashboard
        const userRole = data.data?.user?.role;
        switch (userRole) {
          case "admin":
            redirectPath = "/admin/initialize"; // Admin setup flow
            break;
          case "seller":
            redirectPath = "/seller/dashboard?welcome=true"; // Seller onboarding
            break;
          case "user":
          default:
            redirectPath = "/?welcome=true"; // User welcome experience
            break;
        }
      }

      // Store registration info if storage is available
      if (setStorageItem("registration_complete", new Date().toISOString())) {
        setStorageItem("registered_role", data.data.user.role);
      }

      router.push(redirectPath);
      router.refresh();
    } catch (error: any) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    }
  };

  // Enhanced logout function with better storage cleanup
  const logout = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      // Call server logout endpoint to clear cookies
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      dispatch({ type: "LOGOUT" });

      // Clear client-side storage using enhanced storage manager
      removeStorageItem("auth_redirect_after_login");
      removeStorageItem("guest_cart");
      removeStorageItem("test_user");
      removeStorageItem("last_successful_login");
      removeStorageItem("last_login_role");
      removeStorageItem("registration_complete");
      removeStorageItem("registered_role");

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      // Even if server logout fails, clear client state
      dispatch({ type: "LOGOUT" });

      // Clear storage even on error
      removeStorageItem("auth_redirect_after_login");
      removeStorageItem("guest_cart");
      removeStorageItem("test_user");
      removeStorageItem("last_successful_login");
      removeStorageItem("last_login_role");
      removeStorageItem("registration_complete");
      removeStorageItem("registered_role");

      router.push("/");
    }
  };

  // Update profile function
  const updateProfile = async (updates: Partial<AuthUser>) => {
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
      if (state.user && data.success && data.data) {
        const updatedUser = { ...state.user, ...data.data };
        dispatch({ type: "SET_USER", payload: updatedUser });
      } else {
        // Refresh auth state to get the latest data from server
        await checkAuth();
      }
    } catch (error: any) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    }
  };

  // Check auth on mount and set up periodic refresh
  useEffect(() => {
    checkAuth();

    // Set up periodic auth refresh (every 5 minutes) to ensure token validity
    const refreshInterval = setInterval(() => {
      if (state.user && !state.loading) {
        checkAuth();
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Listen for storage changes (for test user updates across tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "test_user") {
        checkAuth();
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageChange);
    }

    return () => {
      clearInterval(refreshInterval);
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleStorageChange);
      }
    };
  }, []);

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
