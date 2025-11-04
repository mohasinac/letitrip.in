"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/(backend)/api/_lib/database/config";
import { apiClient } from "@/lib/api/client";
import {
  StorageManager,
  CookieConsentSettings,
} from "@/lib/storage/cookieConsent";
import { cookieStorage } from "@/lib/storage/cookieStorage";
import { User } from "@/types";

// Extend the base User type with authentication-specific claims
interface AuthUser {
  id: string;
  uid?: string;
  email: string | null;
  displayName?: string | null;
  name?: string;
  phone?: string;
  avatar?: string;
  role: "admin" | "seller" | "user";
  addresses?: any[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  getIdToken?: () => Promise<string>;
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
// Helper function to get the last visited non-auth page
const getLastVisitedPage = (): string | null => {
  // Now handled via session cookies - call API in component
  return null;
};

// Helper function to save current page if it's not an auth page
const saveLastVisitedPageIfValid = (): void => {
  // Now handled via session cookies - call API in component
};

// Helper function to clear the saved page
const clearLastVisitedPage = (): void => {
  // Now handled via session cookies - call API in component
  try {
    if (typeof window !== "undefined") {
      // Clear any legacy localStorage entries
    }
  } catch (error) {
    console.debug("Error clearing last visited page:", error);
  }
};

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

    // Track last visited non-auth page
    saveLastVisitedPageIfValid();
  }, []);

  // Track page changes to save last visited non-auth page
  useEffect(() => {
    const handleRouteChange = () => {
      saveLastVisitedPageIfValid();
    };

    // Save on initial mount
    saveLastVisitedPageIfValid();

    // Note: Next.js router doesn't have a direct route change event like traditional routers
    // We'll rely on the component tracking from the pages themselves
    // But we save the page whenever the component updates
    handleRouteChange();
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

  // Enhanced login function using Firebase Authentication
  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      // Import Firebase auth functions dynamically
      const { signInWithEmailAndPassword } = await import("firebase/auth");

      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      // Save redirect path from URL params or last visited non-auth page
      if (typeof window !== "undefined") {
        const redirectParam = new URLSearchParams(window.location.search).get(
          "redirect"
        );

        // Priority: URL param > last visited non-auth page > default
        const redirectPath = redirectParam || getLastVisitedPage();

        if (redirectPath && isValidRedirectPath(redirectPath)) {
          setStorageItem("auth_redirect_after_login", redirectPath);
        }
      }

      console.log("Firebase login successful:", firebaseUser.email);

      // Note: The onAuthStateChanged listener will fetch user data and update state
      // We'll redirect after user state is set in the listener
    } catch (error: any) {
      const errorMessage = error.message || "Login failed";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      dispatch({ type: "SET_LOADING", payload: false });
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

      const data = await apiClient.post("/auth/register", {
        name,
        email,
        password,
        role,
      });

      // Handle both response formats
      const userData = data.data?.user || data.user;

      if (!userData) {
        throw new Error("Invalid response format - no user data");
      }

      // Server returns user data, enhance it with claims
      const userWithClaims = {
        ...userData,
        claims: {
          permissions: getRolePermissions(userData.role),
          lastLogin: new Date().toISOString(),
          sessionId: generateSessionId(),
        },
      };

      dispatch({ type: "SET_USER", payload: userWithClaims });

      // Enhanced redirect logic similar to login
      let intendedPath: string | null = null;

      if (typeof window !== "undefined") {
        // Try multiple sources for redirect path
        // Priority: stored redirect > URL param > last visited non-auth page
        intendedPath =
          getStorageItem("auth_redirect_after_login") ||
          new URLSearchParams(window.location.search).get("redirect") ||
          getLastVisitedPage();
      }

      // Clear stored redirect paths
      removeStorageItem("auth_redirect_after_login");
      clearLastVisitedPage();

      // Determine final redirect path
      let redirectPath = "/";

      if (intendedPath && isValidRedirectPath(intendedPath)) {
        redirectPath = intendedPath;
      } else {
        // For new registrations, show role-specific onboarding or dashboard
        const userRole = userData?.role;
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
        setStorageItem("registered_role", userData.role);
      }

      router.push(redirectPath);
      router.refresh();
    } catch (error: any) {
      const errorMessage = error.message || "Registration failed";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
      throw error;
    }
  };

  // Enhanced logout function using Firebase Authentication
  const logout = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      // Import Firebase auth function dynamically
      const { signOut } = await import("firebase/auth");

      // Sign out from Firebase
      await signOut(auth);

      dispatch({ type: "LOGOUT" });

      // Clear client-side storage using enhanced storage manager
      removeStorageItem("auth_redirect_after_login");
      removeStorageItem("guest_cart");
      removeStorageItem("test_user");
      removeStorageItem("last_successful_login");
      removeStorageItem("last_login_role");
      removeStorageItem("registration_complete");
      removeStorageItem("registered_role");

      // Clear guest session and last visited page
      cookieStorage.removeGuestSession();
      cookieStorage.removeLastVisitedPage();

      console.log("Firebase logout successful");
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      // Even if Firebase logout fails, clear client state
      dispatch({ type: "LOGOUT" });

      // Clear storage even on error
      removeStorageItem("auth_redirect_after_login");
      removeStorageItem("guest_cart");
      removeStorageItem("test_user");
      removeStorageItem("last_successful_login");
      removeStorageItem("last_login_role");
      removeStorageItem("registration_complete");
      removeStorageItem("registered_role");

      // Clear guest session and last visited page
      cookieStorage.removeGuestSession();
      cookieStorage.removeLastVisitedPage();

      router.push("/");
    }
  };

  // Update profile function
  const updateProfile = async (updates: Partial<AuthUser>) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      const data = await apiClient.put("/user/profile", updates);

      // Immediately update the user state with the merged data
      if (state.user) {
        const updatedUser = {
          ...state.user,
          ...updates, // Apply the updates immediately
          ...(data.success && data.data ? data.data : {}), // Merge server response if available
        };
        dispatch({ type: "SET_USER", payload: updatedUser });
      }
    } catch (error: any) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Check auth on mount and set up Firebase listener
  useEffect(() => {
    let isInitialLoad = true;

    // Helper function to retry getting user data with backoff
    const getUserDataWithRetry = async (
      firebaseUser: any,
      maxAttempts: number = 5
    ): Promise<any | null> => {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const userData = await apiClient.get("/api/auth/me", {
            timeout: 30000,
          });

          if (userData && typeof userData === "object") {
            return userData;
          }
        } catch (error: any) {
          console.log(
            `Attempt ${attempt}/${maxAttempts} to fetch user data failed:`,
            error.response?.status,
            error.response?.data?.error
          );

          // If it's a 401 and not the last attempt, retry with backoff
          if (error.response?.status === 401 && attempt < maxAttempts) {
            // Exponential backoff: 500ms, 1s, 2s, 4s, 8s
            const delay = 500 * Math.pow(2, attempt - 1);
            console.log(`Retrying in ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }

          // If it's the last attempt or a different error, throw
          throw error;
        }
      }
      return null;
    };

    // Set up Firebase authentication state listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get Firebase ID token
          const token = await firebaseUser.getIdToken();

          // Get user data from API with retry logic for 401 errors
          try {
            const userData = await getUserDataWithRetry(firebaseUser, 5);

            if (userData && typeof userData === "object") {
              // Enhance user data with Firebase methods and claims
              const userWithFirebase = {
                ...userData,
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || userData.name,
                getIdToken: () => firebaseUser.getIdToken(),
                claims: userData.claims || {
                  permissions: getRolePermissions(userData.role),
                  lastLogin: new Date().toISOString(),
                  sessionId: generateSessionId(),
                },
              };

              console.log(
                "Firebase auth state: user authenticated",
                userWithFirebase.role
              );
              dispatch({ type: "SET_USER", payload: userWithFirebase });

              // Handle redirect after authentication (only after login, not on initial load)
              if (!isInitialLoad && typeof window !== "undefined") {
                // Priority: stored redirect > last visited non-auth page > default
                const redirectPath =
                  getStorageItem("auth_redirect_after_login") ||
                  getLastVisitedPage();

                if (redirectPath && isValidRedirectPath(redirectPath)) {
                  removeStorageItem("auth_redirect_after_login");
                  clearLastVisitedPage();
                  router.push(redirectPath);
                } else {
                  // Role-based redirect
                  const defaultPath = getDefaultRedirectForRole(
                    userWithFirebase.role
                  );
                  if (
                    window.location.pathname === "/login" ||
                    window.location.pathname === "/register"
                  ) {
                    clearLastVisitedPage();
                    router.push(defaultPath);
                  }
                }
              }
            } else {
              console.warn("No user data from API, logging out");
              dispatch({ type: "SET_USER", payload: null });
            }
          } catch (apiError: any) {
            // If API fails after all retries, use Firebase fallback
            console.log(
              "API error fetching user data after retries, using Firebase fallback:",
              apiError.response?.status
            );

            const basicUser = {
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              name:
                firebaseUser.displayName || firebaseUser.email?.split("@")[0],
              role: "user" as const,
              getIdToken: () => firebaseUser.getIdToken(),
              claims: {
                permissions: getRolePermissions("user"),
                lastLogin: new Date().toISOString(),
                sessionId: generateSessionId(),
              },
            };
            console.log("Using basic Firebase user data as fallback");
            dispatch({ type: "SET_USER", payload: basicUser });

            // Handle redirect even with fallback user
            if (!isInitialLoad && typeof window !== "undefined") {
              // Priority: stored redirect > last visited non-auth page > default
              const redirectPath =
                getStorageItem("auth_redirect_after_login") ||
                getLastVisitedPage();

              if (redirectPath && isValidRedirectPath(redirectPath)) {
                removeStorageItem("auth_redirect_after_login");
                clearLastVisitedPage();
                router.push(redirectPath);
              } else if (
                window.location.pathname === "/login" ||
                window.location.pathname === "/register"
              ) {
                clearLastVisitedPage();
                router.push("/");
              }
            }
          }
        } catch (error) {
          console.error("Error processing Firebase auth state:", error);
          // If anything fails, create basic user object
          const basicUser = {
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            name: firebaseUser.displayName || firebaseUser.email?.split("@")[0],
            role: "user" as const,
            getIdToken: () => firebaseUser.getIdToken(),
            claims: {
              permissions: getRolePermissions("user"),
              lastLogin: new Date().toISOString(),
              sessionId: generateSessionId(),
            },
          };
          console.log("Using basic Firebase user data as fallback");
          dispatch({ type: "SET_USER", payload: basicUser });
        }
      } else {
        // No Firebase user - check for test user
        if (typeof window !== "undefined") {
          const testUser = getStorageItem("test_user");
          if (testUser) {
            try {
              const parsedTestUser = JSON.parse(testUser);
              const userWithClaims = {
                ...parsedTestUser,
                claims: {
                  permissions: getRolePermissions(parsedTestUser.role),
                  lastLogin: new Date().toISOString(),
                  sessionId: generateSessionId(),
                },
              };
              console.log("Using test user:", userWithClaims.role);
              dispatch({ type: "SET_USER", payload: userWithClaims });
              return;
            } catch (e) {
              removeStorageItem("test_user");
            }
          }
        }

        console.log("Firebase auth state: no user");
        dispatch({ type: "SET_USER", payload: null });
      }

      isInitialLoad = false;
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Legacy checkAuth for backward compatibility
  const checkAuth = async () => {
    // This is now handled by Firebase onAuthStateChanged above
    // Keeping for backward compatibility with existing code
    console.log("checkAuth called - handled by Firebase listener");
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
