/**
 * Session Storage Utility
 * Manages user session data including last visited page, cart, and browsing history
 * Works for both authenticated and guest users
 */

import { cookieStorage } from "./cookieStorage";

export interface SessionData {
  lastVisitedPage?: string;
  lastVisitedAt?: string;
  cartItemCount?: number;
  browsing_history?: string[];
  referrer?: string;
}

const SESSION_COOKIE_KEY = "user_session";
const MAX_HISTORY_LENGTH = 10;

export const sessionStorage = {
  /**
   * Get current session data
   */
  getSession(): SessionData | null {
    return cookieStorage.get(SESSION_COOKIE_KEY);
  },

  /**
   * Update session data
   */
  updateSession(data: Partial<SessionData>): void {
    const currentSession = this.getSession() || {};
    const updatedSession = {
      ...currentSession,
      ...data,
      lastVisitedAt: new Date().toISOString(),
    };
    cookieStorage.set(SESSION_COOKIE_KEY, updatedSession, {
      expires: 30, // 30 days
      sameSite: "lax",
    });
  },

  /**
   * Save last visited page
   */
  saveLastVisitedPage(url: string): void {
    // Don't save auth pages or API routes
    if (
      url.includes("/login") ||
      url.includes("/register") ||
      url.includes("/api/") ||
      url.includes("/_next/")
    ) {
      return;
    }

    const currentSession = this.getSession() || {};
    const history = currentSession.browsing_history || [];

    // Add to history if not already the last page
    if (history[history.length - 1] !== url) {
      history.push(url);
      // Keep only last N pages
      if (history.length > MAX_HISTORY_LENGTH) {
        history.shift();
      }
    }

    this.updateSession({
      lastVisitedPage: url,
      browsing_history: history,
    });
  },

  /**
   * Get last visited page (for redirect after login)
   */
  getLastVisitedPage(): string | null {
    const session = this.getSession();
    return session?.lastVisitedPage || null;
  },

  /**
   * Get browsing history
   */
  getBrowsingHistory(): string[] {
    const session = this.getSession();
    return session?.browsing_history || [];
  },

  /**
   * Update cart item count in session
   */
  updateCartCount(count: number): void {
    this.updateSession({ cartItemCount: count });
  },

  /**
   * Save referrer information
   */
  saveReferrer(referrer: string): void {
    if (referrer && !referrer.includes(window.location.hostname)) {
      this.updateSession({ referrer });
    }
  },

  /**
   * Clear session data (on logout)
   */
  clearSession(): void {
    cookieStorage.remove(SESSION_COOKIE_KEY);
  },

  /**
   * Get redirect URL after login
   * Returns the last visited page or a default page
   */
  getRedirectAfterLogin(): string {
    const lastPage = this.getLastVisitedPage();

    // Don't redirect to auth pages
    if (
      lastPage &&
      !lastPage.includes("/login") &&
      !lastPage.includes("/register") &&
      !lastPage.includes("/forgot-password")
    ) {
      return lastPage;
    }

    // Default to account dashboard
    return "/account/dashboard";
  },

  /**
   * Sync session to user database (for authenticated users)
   * This should be called after login
   */
  async syncToDatabase(userId: string): Promise<void> {
    const session = this.getSession();
    if (!session) return;

    try {
      await fetch("/api/user/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          sessionData: session,
        }),
      });
    } catch (error) {
      // Fail silently - session sync is not critical
    }
  },

  /**
   * Restore session from database (after login)
   */
  async restoreFromDatabase(userId: string): Promise<void> {
    try {
      const response = await fetch(`/api/user/session?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.sessionData) {
          // Merge database session with current cookie session
          const currentSession = this.getSession() || {};
          this.updateSession({
            ...data.sessionData,
            ...currentSession, // Current session takes priority
          });
        }
      }
    } catch (error) {
      // Fail silently - session restore is not critical
    }
  },
};
