/**
 * Session Repository
 *
 * Data access layer for session management.
 * Handles CRUD operations and session lifecycle.
 */

import { BaseRepository } from "./base.repository";
import {
  SESSION_COLLECTION,
  SessionDocument,
  SessionCreateInput,
  SessionUpdateInput,
  sessionQueryHelpers,
  SESSION_EXPIRATION_MS,
  generateSessionId,
} from "@/db/schema/sessions";

export class SessionRepository extends BaseRepository<SessionDocument> {
  constructor() {
    super(SESSION_COLLECTION);
  }

  /**
   * Create new session with generated ID
   * Returns the session with the generated ID
   */
  async createSession(
    userId: string,
    data: Omit<SessionCreateInput, "userId" | "expiresAt" | "isActive">,
  ): Promise<SessionDocument> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_EXPIRATION_MS);
    const sessionId = generateSessionId();

    const sessionData: Omit<SessionDocument, "id"> = {
      userId,
      deviceInfo: data.deviceInfo,
      location: data.location,
      createdAt: now,
      lastActivity: now,
      expiresAt,
      isActive: true,
    };

    return this.createWithId(sessionId, sessionData);
  }

  /**
   * Update session activity
   */
  async updateActivity(
    sessionId: string,
    data?: Partial<SessionUpdateInput>,
  ): Promise<void> {
    const updateData: Partial<SessionDocument> = {
      lastActivity: new Date(),
      ...(data?.location && { location: data.location }),
    };

    await this.update(sessionId, updateData);
  }

  /**
   * Revoke session
   */
  async revokeSession(sessionId: string, revokedBy: string): Promise<void> {
    await this.update(sessionId, {
      isActive: false,
      revokedAt: new Date(),
      revokedBy,
    } as any);
  }

  /**
   * Revoke all user sessions
   */
  async revokeAllUserSessions(
    userId: string,
    revokedBy: string,
  ): Promise<number> {
    const sessions = await this.findActiveByUser(userId);

    for (const session of sessions) {
      await this.revokeSession(session.id, revokedBy);
    }

    return sessions.length;
  }

  /**
   * Find active sessions by user
   */
  async findActiveByUser(userId: string): Promise<SessionDocument[]> {
    try {
      const now = new Date();
      const snapshot = await this.getCollection()
        .where("userId", "==", userId)
        .where("isActive", "==", true)
        .where("expiresAt", ">", now)
        .orderBy("expiresAt", "desc")
        .orderBy("lastActivity", "desc")
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as unknown as SessionDocument[];
    } catch (error) {
      console.error("Error finding active sessions by user:", error);
      return [];
    }
  }

  /**
   * Find all sessions by user (including expired/revoked)
   */
  async findAllByUser(
    userId: string,
    limitCount = 10,
  ): Promise<SessionDocument[]> {
    try {
      const snapshot = await this.getCollection()
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .limit(limitCount)
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as unknown as SessionDocument[];
    } catch (error) {
      console.error("Error finding all sessions by user:", error);
      return [];
    }
  }

  /**
   * Find session by ID and verify it's active
   */
  async findActiveSession(sessionId: string): Promise<SessionDocument | null> {
    const session = await this.findById(sessionId);

    if (!session) return null;
    if (!session.isActive) return null;
    if (session.expiresAt < new Date()) return null;

    return session;
  }

  /**
   * Get all active sessions (admin)
   */
  async getAllActiveSessions(limitCount = 100): Promise<SessionDocument[]> {
    try {
      const now = new Date();
      const snapshot = await this.getCollection()
        .where("isActive", "==", true)
        .where("expiresAt", ">", now)
        .orderBy("expiresAt", "desc")
        .orderBy("lastActivity", "desc")
        .limit(limitCount)
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as unknown as SessionDocument[];
    } catch (error) {
      console.error("Error getting all active sessions:", error);
      return [];
    }
  }

  /**
   * Cleanup expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const now = new Date();
      const snapshot = await this.getCollection()
        .where("expiresAt", "<=", now)
        .limit(500)
        .get();

      let count = 0;
      for (const doc of snapshot.docs) {
        await this.delete(doc.id);
        count++;
      }

      return count;
    } catch (error) {
      console.error("Error cleaning up expired sessions:", error);
      return 0;
    }
  }

  /**
   * Count active sessions by user
   */
  async countActiveByUser(userId: string): Promise<number> {
    const sessions = await this.findActiveByUser(userId);
    return sessions.length;
  }

  /**
   * Get session statistics
   */
  async getStats(): Promise<{
    totalActive: number;
    totalExpired: number;
    uniqueUsers: number;
    recentActivity: number; // Active in last 24h
  }> {
    try {
      const allSessions = await this.getAllActiveSessions(1000);
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const uniqueUsers = new Set(allSessions.map((s) => s.userId)).size;
      const recentActivity = allSessions.filter((s) => {
        const lastActivity =
          s.lastActivity instanceof Date
            ? s.lastActivity
            : new Date(s.lastActivity);
        return lastActivity >= yesterday;
      }).length;

      // Count expired
      const now = new Date();
      const expiredSnapshot = await this.getCollection()
        .where("expiresAt", "<=", now)
        .limit(1000)
        .get();

      return {
        totalActive: allSessions.length,
        totalExpired: expiredSnapshot.size,
        uniqueUsers,
        recentActivity,
      };
    } catch (error) {
      console.error("Error getting session stats:", error);
      return {
        totalActive: 0,
        totalExpired: 0,
        uniqueUsers: 0,
        recentActivity: 0,
      };
    }
  }
}

// Singleton instance
export const sessionRepository = new SessionRepository();
