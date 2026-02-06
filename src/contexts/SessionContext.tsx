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
        return value;
      }
    }
    return null;
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
        console.error("Error fetching user profile:", error);
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
          console.error("Firestore subscription error:", error);
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
      console.error("Session validation failed:", error);
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      // Clear session on server
      await fetch("/api/auth/session", {
        method: "DELETE",
        credentials: "include",
      });

      // Sign out from Firebase
      await auth.signOut();

      // Clear state
      setUser(null);
      setSessionId(null);

      // Clean up Firestore subscription
      if (firestoreUnsubscribeRef.current) {
        firestoreUnsubscribeRef.current();
        firestoreUnsubscribeRef.current = null;
      }
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = firebaseOnAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        // Fetch user profile
        const userData = await fetchUserProfile(authUser);
        setUser(userData);

        // Get session ID
        const currentSessionId = getSessionIdFromCookie();
        setSessionId(currentSessionId);

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
