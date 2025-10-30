"use client";

import { useEffect, useState, useCallback } from "react";
import { COOKIE_CONSTANTS } from "@/constants/app";

interface CookieSessionData {
  sessionId: string;
  userId?: string;
  lastVisitedPage?: string;
  previousPage?: string;
  cartItemCount?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Hook for managing user sessions via cookies
 * Provides easy access to session data and methods to update it
 */
export const useSession = () => {
  const [session, setSession] = useState<CookieSessionData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch session data from API
  const fetchSession = useCallback(async () => {
    try {
      const response = await fetch("/api/sessions", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setSession(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch session:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize session on mount
  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Update last visited page
  const updateLastVisitedPage = useCallback(async (page: string) => {
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update_page",
          data: { page },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSession((prev) =>
          prev ? { ...prev, lastVisitedPage: page } : null,
        );
      }
    } catch (error) {
      console.error("Failed to update last visited page:", error);
    }
  }, []);

  // Update cart count
  const updateCartCount = useCallback(async (count: number) => {
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update_cart",
          data: { count },
        }),
      });

      if (response.ok) {
        setSession((prev) => (prev ? { ...prev, cartItemCount: count } : null));
      }
    } catch (error) {
      console.error("Failed to update cart count:", error);
    }
  }, []);

  // Set user in session
  const setUserInSession = useCallback(async (userId: string) => {
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "set_user",
          data: { userId },
        }),
      });

      if (response.ok) {
        setSession((prev) => (prev ? { ...prev, userId } : null));
      }
    } catch (error) {
      console.error("Failed to set user in session:", error);
    }
  }, []);

  // Get last visited page
  const getLastVisitedPage = useCallback(async () => {
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "get_last_page",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.data?.lastVisitedPage || null;
      }
    } catch (error) {
      console.error("Failed to get last visited page:", error);
    }
    return null;
  }, []);

  // Get cart count
  const getCartCount = useCallback(async () => {
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "get_cart_count",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.data?.cartCount || 0;
      }
    } catch (error) {
      console.error("Failed to get cart count:", error);
    }
    return 0;
  }, []);

  // Clear session (logout)
  const clearSession = useCallback(async () => {
    try {
      await fetch("/api/sessions", {
        method: "DELETE",
        credentials: "include",
      });
      setSession(null);
    } catch (error) {
      console.error("Failed to clear session:", error);
    }
  }, []);

  return {
    session,
    loading,
    updateLastVisitedPage,
    updateCartCount,
    setUserInSession,
    getLastVisitedPage,
    getCartCount,
    clearSession,
    refetch: fetchSession,
  };
};

export default useSession;
