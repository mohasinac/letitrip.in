/**
 * User Session Database Service
 * Manages user sessions and browsing history in Firestore
 * Server-side service for session persistence
 */

import { getAdminDb } from "./admin";
import { DATABASE_CONSTANTS } from "@/constants/app";

interface UserSession {
  userId: string;
  sessionId: string;
  lastVisitedPage?: string;
  browsing_history?: string[];
  cartItemCount?: number;
  referrer?: string;
  deviceInfo?: {
    userAgent: string;
    ip?: string;
  };
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

interface BrowsingHistory {
  userId: string;
  page: string;
  visitedAt: string;
  referrer?: string;
  sessionId: string;
}

export class SessionService {
  private readonly db = getAdminDb();
  private readonly sessionsCollection = DATABASE_CONSTANTS.COLLECTIONS.SESSIONS;
  private readonly historyCollection =
    DATABASE_CONSTANTS.COLLECTIONS.BROWSING_HISTORY;

  /**
   * Create or update user session
   */
  async createSession(
    userId: string,
    sessionId: string,
    data: Partial<UserSession> = {},
    expiresInDays: number = 30,
  ): Promise<UserSession> {
    const now = new Date().toISOString();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const session: UserSession = {
      userId,
      sessionId,
      lastVisitedPage: data.lastVisitedPage,
      browsing_history: data.browsing_history || [],
      cartItemCount: data.cartItemCount || 0,
      referrer: data.referrer,
      deviceInfo: data.deviceInfo,
      createdAt: data.createdAt || now,
      updatedAt: now,
      expiresAt: expiresAt.toISOString(),
    };

    await this.db
      .collection(this.sessionsCollection)
      .doc(sessionId)
      .set(session, { merge: true });

    return session;
  }

  /**
   * Get user session
   */
  async getSession(sessionId: string): Promise<UserSession | null> {
    try {
      const doc = await this.db
        .collection(this.sessionsCollection)
        .doc(sessionId)
        .get();

      if (!doc.exists) return null;

      const session = doc.data() as UserSession;

      // Check if session is expired
      if (new Date(session.expiresAt) < new Date()) {
        await this.deleteSession(sessionId);
        return null;
      }

      return session;
    } catch (error) {
      console.error("Error getting session:", error);
      return null;
    }
  }

  /**
   * Update last visited page
   */
  async updateLastVisitedPage(
    sessionId: string,
    userId: string,
    page: string,
  ): Promise<void> {
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
      const batch = this.db.batch();

      // Update session
      const sessionRef = this.db
        .collection(this.sessionsCollection)
        .doc(sessionId);
      batch.update(sessionRef, {
        lastVisitedPage: page,
        updatedAt: new Date().toISOString(),
      });

      // Add to browsing history
      const historyRef = this.db.collection(this.historyCollection).doc();
      batch.set(historyRef, {
        userId,
        page,
        sessionId,
        visitedAt: new Date().toISOString(),
      } as BrowsingHistory);

      await batch.commit();
    } catch (error) {
      console.error("Error updating last visited page:", error);
    }
  }

  /**
   * Get browsing history for user
   */
  async getBrowsingHistory(
    userId: string,
    limit: number = 50,
  ): Promise<BrowsingHistory[]> {
    try {
      const snapshot = await this.db
        .collection(this.historyCollection)
        .where("userId", "==", userId)
        .orderBy("visitedAt", "desc")
        .limit(limit)
        .get();

      return snapshot.docs.map((doc) => doc.data() as BrowsingHistory);
    } catch (error) {
      console.error("Error getting browsing history:", error);
      return [];
    }
  }

  /**
   * Update cart count in session
   */
  async updateCartCount(sessionId: string, count: number): Promise<void> {
    try {
      await this.db.collection(this.sessionsCollection).doc(sessionId).update({
        cartItemCount: count,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating cart count:", error);
    }
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId: string): Promise<void> {
    try {
      await this.db.collection(this.sessionsCollection).doc(sessionId).delete();
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  }

  /**
   * Clean up expired sessions (should be run by a scheduled task)
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const now = new Date().toISOString();
      const snapshot = await this.db
        .collection(this.sessionsCollection)
        .where("expiresAt", "<", now)
        .limit(DATABASE_CONSTANTS.BATCH_SIZE)
        .get();

      const batch = this.db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      if (snapshot.docs.length > 0) {
        await batch.commit();
      }

      return snapshot.docs.length;
    } catch (error) {
      console.error("Error cleaning up expired sessions:", error);
      return 0;
    }
  }

  /**
   * Get all active sessions for a user
   */
  async getUserActiveSessions(userId: string): Promise<UserSession[]> {
    try {
      const now = new Date().toISOString();
      const snapshot = await this.db
        .collection(this.sessionsCollection)
        .where("userId", "==", userId)
        .where("expiresAt", ">", now)
        .orderBy("expiresAt", "desc")
        .get();

      return snapshot.docs.map((doc) => doc.data() as UserSession);
    } catch (error) {
      console.error("Error getting user sessions:", error);
      return [];
    }
  }

  /**
   * Invalidate all sessions for a user (logout everywhere)
   */
  async invalidateAllUserSessions(userId: string): Promise<void> {
    try {
      const snapshot = await this.db
        .collection(this.sessionsCollection)
        .where("userId", "==", userId)
        .get();

      const batch = this.db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      if (snapshot.docs.length > 0) {
        await batch.commit();
      }
    } catch (error) {
      console.error("Error invalidating user sessions:", error);
    }
  }
}

export const sessionService = new SessionService();
