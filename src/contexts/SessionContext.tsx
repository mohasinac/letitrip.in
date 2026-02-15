"use client";

/**
 * Session Context Provider
 *
 * Manages session state across the application using session ID-based tracking.
 * Combines Firebase Auth state with server-side session validation.
 *
 * Features:
 * - Session ID tracking via cookies
 * - Automatic session activity updates
 * - Cross-component state synchronization
 * - Server-side session validation
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  User,
  onAuthStateChanged as firebaseOnAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { ERROR_MESSAGES, API_ENDPOINTS } from "@/constants";
import { getCookie, hasCookie, deleteCookie } from "@/utils";
import { logger } from "@/classes";
import type { AvatarMetadata } from "@/db/schema";
import type { UserRole } from "@/types/auth";

// ============================================================================
// Types
// ============================================================================

export interface SessionUser {
  // Firebase Auth fields
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;

  // Firestore profile fields
  role: UserRole;
  disabled?: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  // Session fields
  sessionId?: string;

  // Additional profile fields
  phoneVerified?: boolean;

  // Public profile settings
  publicProfile?: {
    isPublic?: boolean;
    showEmail?: boolean;
    showPhone?: boolean;
    showOrders?: boolean;
    showWishlist?: boolean;
    bio?: string;
    location?: string;
    website?: string;
    socialLinks?: {
      twitter?: string;
      instagram?: string;
      facebook?: string;
      linkedin?: string;
    };
  };

  // User statistics
  stats?: {
    totalOrders?: number;
    auctionsWon?: number;
    itemsSold?: number;
    reviewsCount?: number;
    rating?: number;
  };

  // Metadata (login tracking)
  metadata?: {
    lastSignInTime?: string;
    creationTime?: string;
    loginCount?: number;
  };

  // Avatar metadata (matches ImageCropData type for AvatarDisplay)
  avatarMetadata?: AvatarMetadata | null;
}

export interface SessionContextValue {
  user: SessionUser | null;
  loading: boolean;
  sessionId: string | null;
  isAuthenticated: boolean;

  // Actions
  refreshUser: () => Promise<void>;
  refreshSession: () => Promise<void>;
  signOut: () => Promise<void>;
  updateSessionActivity: () => Promise<void>;
}

// ============================================================================
// Context
// ============================================================================

const SessionContext = createContext<SessionContextValue | undefined>(
  undefined,
);

// ============================================================================
// Provider
// ============================================================================

interface SessionProviderProps {
  children: React.ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const activityUpdateRef = useRef<NodeJS.Timeout | null>(null);
  const updateSessionActivityRef = useRef<(() => Promise<void>) | undefined>(
    undefined,
  );
  const signOutRef = useRef<(() => Promise<void>) | undefined>(undefined);

  // Get session ID from cookie
  const getSessionIdFromCookie = useCallback((): string | null => {
    return getCookie("__session_id");
  }, []);

  // Check if session cookie exists
  // NOTE: __session is httpOnly and can't be read by JS.
  // We check __session_id instead (httpOnly: false) as a proxy.
  const hasSessionCookie = useCallback((): boolean => {
    return hasCookie("__session_id");
  }, []);

  // Fetch user profile from API (not direct Firestore access)
  const fetchUserProfile = useCallback(
    async (authUser: User): Promise<SessionUser> => {
      try {
        // Use API endpoint instead of direct Firestore access
        // This maintains API-only architecture and respects security rules
        const response = await fetch(API_ENDPOINTS.USER.PROFILE, {
          method: "GET",
          credentials: "include", // Include session cookie
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const { data } = await response.json();
        const currentSessionId = getSessionIdFromCookie();

        // Return session user with data from API
        return {
          uid: authUser.uid,
          email: authUser.email,
          emailVerified: authUser.emailVerified,
          displayName: data.displayName || authUser.displayName,
          photoURL: data.photoURL || authUser.photoURL,
          phoneNumber: data.phoneNumber || authUser.phoneNumber,
          role: data.role || "user",
          disabled: data.disabled,
          createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
          updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
          sessionId: currentSessionId || undefined,
          phoneVerified: data.phoneVerified,
          avatarMetadata: data.avatarMetadata?.url
            ? {
                url: data.avatarMetadata.url,
                position: data.avatarMetadata.position || { x: 50, y: 50 },
                zoom: data.avatarMetadata.zoom || 1,
              }
            : null,
        };
      } catch (error) {
        logger.error(ERROR_MESSAGES.SESSION.FETCH_USER_PROFILE_ERROR, {
          error,
        });
        return {
          uid: authUser.uid,
          email: authUser.email,
          emailVerified: authUser.emailVerified,
          displayName: authUser.displayName,
          photoURL: authUser.photoURL,
          phoneNumber: authUser.phoneNumber,
          role: "user",
          sessionId: getSessionIdFromCookie() || undefined,
        };
      }
    },
    [getSessionIdFromCookie],
  );

  // Update session activity
  const updateSessionActivity = useCallback(async () => {
    const currentSessionId = getSessionIdFromCookie();
    if (!currentSessionId || !user) return;

    try {
      await fetch(API_ENDPOINTS.AUTH.SESSION_ACTIVITY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: currentSessionId }),
      });
    } catch (error) {
      // Silent fail - activity update is not critical
      logger.debug("Session activity update failed", { error });
    }
  }, [user, getSessionIdFromCookie]);

  // Keep ref in sync so the effect doesn't depend on the callback identity
  useEffect(() => {
    updateSessionActivityRef.current = updateSessionActivity;
  }, [updateSessionActivity]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    const currentAuth = auth.currentUser;
    if (currentAuth) {
      const userData = await fetchUserProfile(currentAuth);
      setUser(userData);
    }
  }, [fetchUserProfile]);

  // Refresh session (validate with server)
  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.SESSION_VALIDATE, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        // Session invalid, sign out
        await signOutRef.current?.();
        return;
      }

      const data = await response.json();
      if (data.valid && data.sessionId) {
        setSessionId(data.sessionId);
      }
    } catch (error) {
      logger.error(ERROR_MESSAGES.SESSION.VALIDATION_FAILED, { error });
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      // Sign out from Firebase first
      await auth.signOut();

      // Clear session on server (with cookies)
      try {
        await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
          method: "POST",
          credentials: "include",
        });
      } catch (error) {
        logger.error(ERROR_MESSAGES.SESSION.SERVER_LOGOUT_ERROR, { error });
      }

      // Clear state immediately
      setUser(null);
      setSessionId(null);

      // Clear activity timer
      if (activityUpdateRef.current) {
        clearInterval(activityUpdateRef.current);
        activityUpdateRef.current = null;
      }

      // Force clear cookies client-side as backup
      deleteCookie("__session");
      deleteCookie("__session_id");
    } catch (error) {
      logger.error(ERROR_MESSAGES.SESSION.SIGN_OUT_ERROR, { error });
      // Still clear state even if API call fails
      setUser(null);
      setSessionId(null);
      throw error;
    }
  }, []);

  // Keep signOut ref in sync
  useEffect(() => {
    signOutRef.current = signOut;
  }, [signOut]);

  // Listen for auth state changes
  useEffect(() => {
    let authVersion = 0;

    const unsubscribe = firebaseOnAuthStateChanged(auth, async (authUser) => {
      const thisVersion = ++authVersion;

      if (authUser) {
        // Verify session cookie exists
        const hasSession = hasSessionCookie();

        if (!hasSession) {
          // No session cookie but user is authenticated
          // Create session automatically
          try {
            const idToken = await authUser.getIdToken(true);
            if (thisVersion !== authVersion) return; // stale, discard
            const response = await fetch(API_ENDPOINTS.AUTH.CREATE_SESSION, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ idToken }),
              credentials: "include",
            });

            if (thisVersion !== authVersion) return;
            if (response.ok) {
              const data = await response.json();
              setSessionId(data.sessionId);
            }
          } catch (error) {
            logger.error(ERROR_MESSAGES.SESSION.CREATION_ERROR, { error });
          }
        }

        if (thisVersion !== authVersion) return;

        // Fetch user profile
        const userData = await fetchUserProfile(authUser);
        if (thisVersion !== authVersion) return;
        setUser(userData);

        // Get session ID from cookie
        const currentSessionId = getSessionIdFromCookie();
        if (currentSessionId) {
          setSessionId(currentSessionId);
        }

        // Set up activity tracking (every 5 minutes)
        if (activityUpdateRef.current) {
          clearInterval(activityUpdateRef.current);
        }
        activityUpdateRef.current = setInterval(
          () => updateSessionActivityRef.current?.(),
          5 * 60 * 1000,
        );
      } else {
        // No auth user - clear everything
        setUser(null);
        setSessionId(null);

        // Clean up timers
        if (activityUpdateRef.current) {
          clearInterval(activityUpdateRef.current);
          activityUpdateRef.current = null;
        }

        // Clear cookies if they still exist
        if (hasSessionCookie()) {
          deleteCookie("__session");
          deleteCookie("__session_id");
        }
      }

      setLoading(false);
    });

    return () => {
      authVersion++; // Invalidate any in-flight async work
      unsubscribe();
      if (activityUpdateRef.current) {
        clearInterval(activityUpdateRef.current);
      }
    };
  }, [fetchUserProfile, getSessionIdFromCookie, hasSessionCookie]);

  const value = useMemo<SessionContextValue>(
    () => ({
      user,
      loading,
      sessionId,
      isAuthenticated: !!user && !!sessionId,
      refreshUser,
      refreshSession,
      signOut,
      updateSessionActivity,
    }),
    [
      user,
      loading,
      sessionId,
      refreshUser,
      refreshSession,
      signOut,
      updateSessionActivity,
    ],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to access session context
 * Must be used within SessionProvider
 */
export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);

  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }

  return context;
}

/**
 * Hook to access authentication state
 * Provides user, loading state, and refresh functionality
 */
export function useAuth() {
  const { user, loading, refreshUser } = useSession();
  return { user, loading, refreshUser };
}
