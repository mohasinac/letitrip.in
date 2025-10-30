/**
 * Cookie-based Session Management
 * Handles user sessions and page tracking using secure HTTP-only cookies
 * Server-side service for session management via cookies
 */

import { cookies } from "next/headers";
import { COOKIE_CONSTANTS } from "@/constants/app";

export interface CookieSessionData {
  sessionId: string;
  userId?: string;
  lastVisitedPage?: string;
  previousPage?: string;
  cartItemCount?: number;
  createdAt: string;
  updatedAt: string;
}

export class CookieSessionService {
  /**
   * Create or get user session from cookies
   */
  static async getOrCreateSession(): Promise<CookieSessionData> {
    const cookieStore = await cookies();
    let sessionData = this.getSessionFromCookie();

    if (!sessionData) {
      sessionData = {
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.setSessionCookie(sessionData);
    }

    return sessionData;
  }

  /**
   * Get session data from cookie
   */
  static getSessionFromCookie(): CookieSessionData | null {
    try {
      // This is a placeholder - actual implementation would be in middleware
      // For now, return null to indicate no session in cookie
      return null;
    } catch (error) {
      console.error("Error parsing session cookie:", error);
      return null;
    }
  }

  /**
   * Set session cookie
   */
  static async setSessionCookie(data: CookieSessionData): Promise<void> {
    try {
      const cookieStore = await cookies();

      cookieStore.set(
        COOKIE_CONSTANTS.SESSION_COOKIE_NAME,
        JSON.stringify(data),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: COOKIE_CONSTANTS.SESSION_EXPIRY_DAYS * 24 * 60 * 60, // in seconds
          path: "/",
        },
      );
    } catch (error) {
      console.error("Error setting session cookie:", error);
    }
  }

  /**
   * Update last visited page
   */
  static async updateLastVisitedPage(page: string): Promise<void> {
    // Don't save auth pages or API routes
    if (
      page.includes("/login") ||
      page.includes("/register") ||
      page.includes("/api/") ||
      page.includes("/_next/")
    ) {
      return;
    }

    try {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get(
        COOKIE_CONSTANTS.SESSION_COOKIE_NAME,
      );

      if (sessionCookie?.value) {
        const sessionData: CookieSessionData = JSON.parse(sessionCookie.value);

        const updatedSession = {
          ...sessionData,
          previousPage: sessionData.lastVisitedPage,
          lastVisitedPage: page,
          updatedAt: new Date().toISOString(),
        };

        await this.setSessionCookie(updatedSession);
      }
    } catch (error) {
      console.error("Error updating last visited page:", error);
    }
  }

  /**
   * Update cart count in session
   */
  static async updateCartCount(count: number): Promise<void> {
    try {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get(
        COOKIE_CONSTANTS.SESSION_COOKIE_NAME,
      );

      if (sessionCookie?.value) {
        const sessionData: CookieSessionData = JSON.parse(sessionCookie.value);

        const updatedSession = {
          ...sessionData,
          cartItemCount: count,
          updatedAt: new Date().toISOString(),
        };

        await this.setSessionCookie(updatedSession);
      }
    } catch (error) {
      console.error("Error updating cart count:", error);
    }
  }

  /**
   * Set user ID in session
   */
  static async setUserInSession(userId: string): Promise<void> {
    try {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get(
        COOKIE_CONSTANTS.SESSION_COOKIE_NAME,
      );

      if (sessionCookie?.value) {
        const sessionData: CookieSessionData = JSON.parse(sessionCookie.value);

        const updatedSession = {
          ...sessionData,
          userId,
          updatedAt: new Date().toISOString(),
        };

        await this.setSessionCookie(updatedSession);
      } else {
        // Create new session with user
        const newSession: CookieSessionData = {
          sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await this.setSessionCookie(newSession);
      }
    } catch (error) {
      console.error("Error setting user in session:", error);
    }
  }

  /**
   * Clear session cookie
   */
  static async clearSession(): Promise<void> {
    try {
      const cookieStore = await cookies();
      cookieStore.delete(COOKIE_CONSTANTS.SESSION_COOKIE_NAME);
    } catch (error) {
      console.error("Error clearing session:", error);
    }
  }

  /**
   * Get last visited page from cookie
   */
  static async getLastVisitedPage(): Promise<string | null> {
    try {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get(
        COOKIE_CONSTANTS.SESSION_COOKIE_NAME,
      );

      if (sessionCookie?.value) {
        const sessionData: CookieSessionData = JSON.parse(sessionCookie.value);
        return sessionData.lastVisitedPage || null;
      }

      return null;
    } catch (error) {
      console.error("Error getting last visited page:", error);
      return null;
    }
  }

  /**
   * Get cart count from session
   */
  static async getCartCount(): Promise<number> {
    try {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get(
        COOKIE_CONSTANTS.SESSION_COOKIE_NAME,
      );

      if (sessionCookie?.value) {
        const sessionData: CookieSessionData = JSON.parse(sessionCookie.value);
        return sessionData.cartItemCount || 0;
      }

      return 0;
    } catch (error) {
      console.error("Error getting cart count:", error);
      return 0;
    }
  }

  /**
   * Get user ID from session
   */
  static async getUserIdFromSession(): Promise<string | null> {
    try {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get(
        COOKIE_CONSTANTS.SESSION_COOKIE_NAME,
      );

      if (sessionCookie?.value) {
        const sessionData: CookieSessionData = JSON.parse(sessionCookie.value);
        return sessionData.userId || null;
      }

      return null;
    } catch (error) {
      console.error("Error getting user ID from session:", error);
      return null;
    }
  }
}

export const cookieSessionService = CookieSessionService;
