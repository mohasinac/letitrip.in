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
import type { AuthUser } from "@/types/auth";
import {
  onAuthStateChanged,
  getCurrentUser,
  signOut as firebaseSignOut,
} from "@/lib/firebase/auth-helpers";
import { ERROR_MESSAGES } from "@/constants";
import { getCookie, hasCookie, deleteCookie } from "@/utils";
import { logger } from "@/classes";
import { sessionService, authService } from "@/services";
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
    async (authUser: AuthUser): Promise<SessionUser> => {
      try {
        // Use session service (apiClient with credentials) instead of raw fetch
        const data = await sessionService.getProfile();
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

  // Fetch user profile from server session cookie only (no Firebase SDK user required).
  // Used for server-side auth flows (Google OAuth, Apple OAuth) where the client SDK
  // is never signed in directly.
  const fetchUserProfileFromServer =
    useCallback(async (): Promise<SessionUser | null> => {
      try {
        const data = await sessionService.getProfile();
        const currentSessionId = getSessionIdFromCookie();
        return {
          uid: data.uid,
          email: data.email || null,
          emailVerified: data.emailVerified || false,
          displayName: data.displayName || null,
          photoURL: data.photoURL || null,
          phoneNumber: data.phoneNumber || null,
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
      } catch {
        return null;
      }
    }, [getSessionIdFromCookie]);

  // Update session activity
  const updateSessionActivity = useCallback(async () => {
    const currentSessionId = getSessionIdFromCookie();
    if (!currentSessionId || !user) return;

    try {
      await sessionService.recordActivity({ sessionId: currentSessionId });
    } catch (error) {
      // Silent fail - activity update is not critical
      logger.debug("Session activity update failed", { error });
    }
  }, [user, getSessionIdFromCookie]);

  // Keep ref in sync so the effect doesn't depend on the callback identity
  useEffect(() => {
    updateSessionActivityRef.current = updateSessionActivity;
  }, [updateSessionActivity]);

  // Refresh user data — falls back to server-session hydration when Firebase SDK
  // is not signed in (e.g. after Google OAuth or server-side registration).
  const refreshUser = useCallback(async () => {
    const currentAuth = getCurrentUser();
    if (currentAuth) {
      const userData = await fetchUserProfile(currentAuth);
      setUser(userData);
    } else if (hasSessionCookie()) {
      const userData = await fetchUserProfileFromServer();
      if (userData) {
        setUser(userData);
        const sid = getSessionIdFromCookie();
        if (sid) setSessionId(sid);
      }
    }
  }, [
    fetchUserProfile,
    fetchUserProfileFromServer,
    hasSessionCookie,
    getSessionIdFromCookie,
  ]);

  // Refresh session (validate with server)
  const refreshSession = useCallback(async () => {
    try {
      const data = await sessionService.validate();
      if (data.valid && data.sessionId) {
        setSessionId(data.sessionId);
      }
    } catch (error) {
      // Session invalid — sign out
      await signOutRef.current?.();
      logger.error(ERROR_MESSAGES.SESSION.VALIDATION_FAILED, { error });
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      // Clear server session FIRST — this removes __session_id before firebaseSignOut()
      // triggers onAuthStateChanged(null). If __session_id is still present when that
      // callback fires, the "server-session fallback" logic would re-login the user.
      try {
        await authService.logout();
      } catch (error) {
        logger.error(ERROR_MESSAGES.SESSION.SERVER_LOGOUT_ERROR, { error });
      }

      // Now sign out of Firebase SDK (triggers onAuthStateChanged with null)
      await firebaseSignOut();

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

    const unsubscribe = onAuthStateChanged(async (authUser) => {
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
            const data = await sessionService.create({ idToken });

            if (thisVersion !== authVersion) return;
            if (data?.sessionId) {
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
        // No Firebase SDK user.
        // If a session cookie exists this is a server-set session (Google/Apple OAuth,
        // server-side registration) — try to hydrate state from the server session.
        if (hasSessionCookie()) {
          const serverUser = await fetchUserProfileFromServer();
          if (thisVersion !== authVersion) return;
          if (serverUser) {
            setUser(serverUser);
            const sid = getSessionIdFromCookie();
            if (sid) setSessionId(sid);
            setLoading(false);
            return;
          }
          // Profile fetch failed — session is invalid, clear everything
          deleteCookie("__session");
          deleteCookie("__session_id");
        }

        setUser(null);
        setSessionId(null);

        // Clean up timers
        if (activityUpdateRef.current) {
          clearInterval(activityUpdateRef.current);
          activityUpdateRef.current = null;
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
