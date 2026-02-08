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
} from "react";
import {
  User,
  onAuthStateChanged as firebaseOnAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { USER_COLLECTION, UserDocument } from "@/db/schema/users";
import { ERROR_MESSAGES } from "@/constants";

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
  role: string;
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

  // Avatar metadata (matches ImageCropData type for AvatarDisplay)
  avatarMetadata?: {
    url: string;
    position: { x: number; y: number };
    zoom: number;
  } | null;
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
  const firestoreUnsubscribeRef = useRef<(() => void) | null>(null);

  // Get session ID from cookie
  const getSessionIdFromCookie = useCallback((): string | null => {
    if (typeof document === "undefined") return null;
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "__session_id") {
        return decodeURIComponent(value);
      }
    }
    return null;
  }, []);

  // Check if session cookie exists
  const hasSessionCookie = useCallback((): boolean => {
    if (typeof document === "undefined") return false;
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name] = cookie.trim().split("=");
      if (name === "__session") {
        return true;
      }
    }
    return false;
  }, []);

  // Fetch user profile from Firestore
  const fetchUserProfile = useCallback(
    async (authUser: User): Promise<SessionUser> => {
      try {
        const userDocRef = doc(db, USER_COLLECTION, authUser.uid);
        const userDoc = await getDoc(userDocRef);
        const currentSessionId = getSessionIdFromCookie();

        if (userDoc.exists()) {
          const firestoreData = userDoc.data() as UserDocument;

          // Handle Firestore timestamps
          const createdAt =
            firestoreData.createdAt instanceof Date
              ? firestoreData.createdAt
              : (firestoreData.createdAt as any)?.toDate?.() || undefined;
          const updatedAt =
            firestoreData.updatedAt instanceof Date
              ? firestoreData.updatedAt
              : (firestoreData.updatedAt as any)?.toDate?.() || undefined;

          // Only include avatarMetadata if it has a url
          const avatarMetadata = firestoreData.avatarMetadata?.url
            ? {
                url: firestoreData.avatarMetadata.url,
                position: firestoreData.avatarMetadata.position || {
                  x: 50,
                  y: 50,
                },
                zoom: firestoreData.avatarMetadata.zoom || 1,
              }
            : null;

          return {
            uid: authUser.uid,
            email: authUser.email,
            emailVerified: authUser.emailVerified,
            displayName: firestoreData.displayName || authUser.displayName,
            photoURL: firestoreData.photoURL || authUser.photoURL,
            phoneNumber: firestoreData.phoneNumber || authUser.phoneNumber,
            role: firestoreData.role || "user",
            disabled: firestoreData.disabled,
            createdAt,
            updatedAt,
            sessionId: currentSessionId || undefined,
            phoneVerified: firestoreData.phoneVerified,
            publicProfile: firestoreData.publicProfile,
            stats: firestoreData.stats,
            avatarMetadata,
          };
        }

        // Return basic auth user if no Firestore profile
        return {
          uid: authUser.uid,
          email: authUser.email,
          emailVerified: authUser.emailVerified,
          displayName: authUser.displayName,
          photoURL: authUser.photoURL,
          phoneNumber: authUser.phoneNumber,
          role: "user",
          sessionId: currentSessionId || undefined,
        };
      } catch (error) {
        console.error(ERROR_MESSAGES.SESSION.FETCH_USER_PROFILE_ERROR, error);
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

  // Subscribe to Firestore user document for real-time updates
  const subscribeToUserProfile = useCallback(
    (uid: string) => {
      // Clean up previous subscription
      if (firestoreUnsubscribeRef.current) {
        firestoreUnsubscribeRef.current();
      }

      const userDocRef = doc(db, USER_COLLECTION, uid);

      firestoreUnsubscribeRef.current = onSnapshot(
        userDocRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const firestoreData = snapshot.data() as UserDocument;
            const currentSessionId = getSessionIdFromCookie();

            // Only include avatarMetadata if it has a url
            const avatarMetadata = firestoreData.avatarMetadata?.url
              ? {
                  url: firestoreData.avatarMetadata.url,
                  position: firestoreData.avatarMetadata.position || {
                    x: 50,
                    y: 50,
                  },
                  zoom: firestoreData.avatarMetadata.zoom || 1,
                }
              : null;

            setUser((prevUser) => {
              if (!prevUser) return null;
              return {
                ...prevUser,
                displayName: firestoreData.displayName || prevUser.displayName,
                photoURL: firestoreData.photoURL || prevUser.photoURL,
                phoneNumber: firestoreData.phoneNumber || prevUser.phoneNumber,
                role: firestoreData.role || prevUser.role,
                disabled: firestoreData.disabled,
                phoneVerified: firestoreData.phoneVerified,
                publicProfile: firestoreData.publicProfile,
                stats: firestoreData.stats,
                avatarMetadata,
                sessionId: currentSessionId || undefined,
              };
            });
          }
        },
        (error) => {
          console.error(
            ERROR_MESSAGES.SESSION.FIRESTORE_SUBSCRIPTION_ERROR,
            error,
          );
        },
      );
    },
    [getSessionIdFromCookie],
  );

  // Update session activity
  const updateSessionActivity = useCallback(async () => {
    const currentSessionId = getSessionIdFromCookie();
    if (!currentSessionId || !user) return;

    try {
      await fetch("/api/auth/session/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: currentSessionId }),
      });
    } catch (error) {
      // Silent fail - activity update is not critical
      console.debug("Session activity update failed:", error);
    }
  }, [user, getSessionIdFromCookie]);

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
      const response = await fetch("/api/auth/session/validate", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        // Session invalid, sign out
        await signOut();
        return;
      }

      const data = await response.json();
      if (data.valid && data.sessionId) {
        setSessionId(data.sessionId);
      }
    } catch (error) {
      console.error(ERROR_MESSAGES.SESSION.VALIDATION_FAILED, error);
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      // Sign out from Firebase first
      await auth.signOut();

      // Clear session on server (with cookies)
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
      } catch (error) {
        console.error(ERROR_MESSAGES.SESSION.SERVER_LOGOUT_ERROR, error);
      }

      // Clear state immediately
      setUser(null);
      setSessionId(null);

      // Clean up Firestore subscription
      if (firestoreUnsubscribeRef.current) {
        firestoreUnsubscribeRef.current();
        firestoreUnsubscribeRef.current = null;
      }

      // Clear activity timer
      if (activityUpdateRef.current) {
        clearInterval(activityUpdateRef.current);
        activityUpdateRef.current = null;
      }

      // Force clear cookies client-side as backup
      if (typeof document !== "undefined") {
        document.cookie =
          "__session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie =
          "__session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }
    } catch (error) {
      console.error(ERROR_MESSAGES.SESSION.SIGN_OUT_ERROR, error);
      // Still clear state even if API call fails
      setUser(null);
      setSessionId(null);
      throw error;
    }
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = firebaseOnAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        // Verify session cookie exists
        const hasSession = hasSessionCookie();

        if (!hasSession) {
          // No session cookie but user is authenticated
          // Create session automatically
          try {
            const idToken = await authUser.getIdToken(true);
            const response = await fetch("/api/auth/session", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ idToken }),
              credentials: "include",
            });

            if (response.ok) {
              const data = await response.json();
              setSessionId(data.sessionId);
            }
          } catch (error) {
            console.error(ERROR_MESSAGES.SESSION.CREATION_ERROR, error);
          }
        }

        // Fetch user profile
        const userData = await fetchUserProfile(authUser);
        setUser(userData);

        // Get session ID from cookie
        const currentSessionId = getSessionIdFromCookie();
        if (currentSessionId) {
          setSessionId(currentSessionId);
        }

        // Subscribe to real-time updates
        subscribeToUserProfile(authUser.uid);

        // Set up activity tracking (every 5 minutes)
        if (activityUpdateRef.current) {
          clearInterval(activityUpdateRef.current);
        }
        activityUpdateRef.current = setInterval(
          updateSessionActivity,
          5 * 60 * 1000,
        );
      } else {
        // No auth user - clear everything
        setUser(null);
        setSessionId(null);

        // Clean up subscriptions
        if (firestoreUnsubscribeRef.current) {
          firestoreUnsubscribeRef.current();
          firestoreUnsubscribeRef.current = null;
        }
        if (activityUpdateRef.current) {
          clearInterval(activityUpdateRef.current);
          activityUpdateRef.current = null;
        }

        // Clear cookies if they still exist
        if (typeof document !== "undefined") {
          const hasSession = hasSessionCookie();
          if (hasSession) {
            document.cookie =
              "__session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie =
              "__session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          }
        }
      }

      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (firestoreUnsubscribeRef.current) {
        firestoreUnsubscribeRef.current();
      }
      if (activityUpdateRef.current) {
        clearInterval(activityUpdateRef.current);
      }
    };
  }, [
    fetchUserProfile,
    getSessionIdFromCookie,
    hasSessionCookie,
    subscribeToUserProfile,
    updateSessionActivity,
  ]);

  const value: SessionContextValue = {
    user,
    loading,
    sessionId,
    isAuthenticated: !!user && !!sessionId,
    refreshUser,
    refreshSession,
    signOut,
    updateSessionActivity,
  };

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
