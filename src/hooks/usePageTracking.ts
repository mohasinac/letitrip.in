"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { cookieStorage } from "@/lib/storage/cookieStorage";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook to track page visits for both guest and authenticated users
 * Saves last visited page to cookies for guests, and syncs to database for authenticated users
 */
export const usePageTracking = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    if (!pathname) return;

    // Don't track auth pages, API routes, or internal routes
    const shouldSkip =
      pathname.includes("/login") ||
      pathname.includes("/register") ||
      pathname.includes("/api/") ||
      pathname.includes("/_next/") ||
      pathname.includes("/logout");

    if (shouldSkip) return;

    // Save last visited page to cookies
    cookieStorage.setLastVisitedPage(pathname);

    // For guest users, also save to guest session
    if (!user) {
      const guestSession =
        cookieStorage.getGuestSession<{
          cart?: any[];
          lastVisitedPage?: string;
          browsing_history?: string[];
        }>() || {};

      const history = guestSession.browsing_history || [];

      // Add to history if not the last page
      if (history[history.length - 1] !== pathname) {
        history.push(pathname);

        // Keep only last 10 pages
        if (history.length > 10) {
          history.shift();
        }
      }

      cookieStorage.setGuestSession({
        ...guestSession,
        lastVisitedPage: pathname,
        browsing_history: history,
      });
    } else {
      // For authenticated users, sync to database periodically
      // Debounced to avoid too many requests
      const syncTimeout = setTimeout(async () => {
        try {
          await fetch("/api/user/sync-session", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              sessionData: {
                lastVisitedPage: pathname,
                timestamp: new Date().toISOString(),
              },
            }),
          });
        } catch (error) {
          console.error("Failed to sync page visit:", error);
        }
      }, 2000); // Wait 2 seconds before syncing

      return () => clearTimeout(syncTimeout);
    }
  }, [pathname, user]);

  return {
    currentPage: pathname,
    getLastVisitedPage: () => cookieStorage.getLastVisitedPage(),
  };
};
