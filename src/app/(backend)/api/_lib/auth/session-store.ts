/**
 * Session Store - Firestore-backed for Vercel Serverless
 * 
 * Uses Firestore for persistent storage with in-memory caching
 * Compatible with Vercel's serverless environment
 * 
 * Architecture:
 * - Write: Always to Firestore (persistent across function invocations)
 * - Read: Check memory cache first, fallback to Firestore
 * - Cache: Short-lived (5 min) to reduce Firestore reads
 */

import { getAdminDb } from '../database/admin';

export interface SessionData {
  userId: string;
  email: string;
  role: 'admin' | 'seller' | 'user';
  createdAt: number;
  expiresAt: number;
  lastActivity: number;
}

// Session configuration constants
export const SESSION_COOKIE_NAME = 'session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

// In-memory cache with TTL (5 minutes) - per serverless function instance
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const sessionCache = new Map<string, { data: SessionData; cachedAt: number }>();

// Clean up expired cache entries periodically (per function instance)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [sessionId, cached] of sessionCache.entries()) {
      if (now - cached.cachedAt > CACHE_TTL) {
        sessionCache.delete(sessionId);
      }
    }
  }, 60 * 1000); // Clean every minute
}

/**
 * Get Firestore collection reference
 */
function getSessionsCollection() {
  const db = getAdminDb();
  return db.collection('sessions');
}

/**
 * Store session in Firestore
 */
export async function storeSession(sessionId: string, sessionData: SessionData): Promise<void> {
  try {
    const sessionsRef = getSessionsCollection();
    
    // Store in Firestore (persistent across serverless invocations)
    await sessionsRef.doc(sessionId).set({
      ...sessionData,
      sessionId,
      updatedAt: Date.now(),
    });
    
    // Update cache for this function instance
    sessionCache.set(sessionId, {
      data: sessionData,
      cachedAt: Date.now(),
    });
  } catch (error) {
    console.error('Error storing session:', error);
    throw error;
  }
}

/**
 * Get session from cache or Firestore
 */
export async function getStoredSession(sessionId: string): Promise<SessionData | null> {
  try {
    // Check cache first (fast path)
    const cached = sessionCache.get(sessionId);
    if (cached && Date.now() - cached.cachedAt < CACHE_TTL) {
      // Verify not expired
      if (cached.data.expiresAt > Date.now()) {
        return cached.data;
      }
      // Expired - remove from cache
      sessionCache.delete(sessionId);
      await deleteStoredSession(sessionId);
      return null;
    }
    
    // Cache miss - fetch from Firestore
    const sessionsRef = getSessionsCollection();
    const doc = await sessionsRef.doc(sessionId).get();
    
    if (!doc.exists) {
      return null;
    }
    
    const data = doc.data() as SessionData & { sessionId: string; updatedAt: number };
    
    // Check if expired
    if (data.expiresAt < Date.now()) {
      await deleteStoredSession(sessionId);
      return null;
    }
    
    const sessionData: SessionData = {
      userId: data.userId,
      email: data.email,
      role: data.role,
      createdAt: data.createdAt,
      expiresAt: data.expiresAt,
      lastActivity: data.lastActivity,
    };
    
    // Update cache
    sessionCache.set(sessionId, {
      data: sessionData,
      cachedAt: Date.now(),
    });
    
    return sessionData;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Update session in Firestore
 */
export async function updateStoredSession(sessionId: string, updates: Partial<SessionData>): Promise<boolean> {
  try {
    const sessionsRef = getSessionsCollection();
    
    await sessionsRef.doc(sessionId).update({
      ...updates,
      updatedAt: Date.now(),
    });
    
    // Invalidate cache so next read gets fresh data
    sessionCache.delete(sessionId);
    
    return true;
  } catch (error) {
    console.error('Error updating session:', error);
    return false;
  }
}

/**
 * Delete session from Firestore
 */
export async function deleteStoredSession(sessionId: string): Promise<void> {
  try {
    const sessionsRef = getSessionsCollection();
    
    await sessionsRef.doc(sessionId).delete();
    
    // Remove from cache
    sessionCache.delete(sessionId);
  } catch (error) {
    console.error('Error deleting session:', error);
  }
}

/**
 * Delete all sessions for a user (e.g., on password change)
 */
export async function deleteUserSessions(userId: string): Promise<number> {
  try {
    const sessionsRef = getSessionsCollection();
    const snapshot = await sessionsRef.where('userId', '==', userId).get();
    
    let count = 0;
    const batch = getAdminDb().batch();
    
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
      sessionCache.delete(doc.id);
      count++;
    });
    
    await batch.commit();
    return count;
  } catch (error) {
    console.error('Error deleting user sessions:', error);
    return 0;
  }
}

/**
 * Clean up expired sessions (can be called via cron job or API route)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const sessionsRef = getSessionsCollection();
    const now = Date.now();
    
    const snapshot = await sessionsRef.where('expiresAt', '<', now).limit(500).get();
    
    let count = 0;
    const batch = getAdminDb().batch();
    
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
      sessionCache.delete(doc.id);
      count++;
    });
    
    await batch.commit();
    return count;
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
    return 0;
  }
}

/**
 * Get all active sessions (admin only)
 */
export async function getAllActiveSessions(): Promise<Array<SessionData & { sessionId: string }>> {
  try {
    const sessionsRef = getSessionsCollection();
    const now = Date.now();
    
    const snapshot = await sessionsRef.where('expiresAt', '>', now).limit(1000).get();
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        sessionId: doc.id,
        userId: data.userId,
        email: data.email,
        role: data.role,
        createdAt: data.createdAt,
        expiresAt: data.expiresAt,
        lastActivity: data.lastActivity,
      };
    });
  } catch (error) {
    console.error('Error getting all sessions:', error);
    return [];
  }
}

/**
 * Get session statistics (admin dashboard)
 */
export async function getSessionStats() {
  try {
    const sessions = await getAllActiveSessions();
    const now = Date.now();
    
    return {
      total: sessions.length,
      active: sessions.filter(s => s.lastActivity > now - 30 * 60 * 1000).length,
      byRole: {
        admin: sessions.filter(s => s.role === 'admin').length,
        seller: sessions.filter(s => s.role === 'seller').length,
        user: sessions.filter(s => s.role === 'user').length,
      },
    };
  } catch (error) {
    console.error('Error getting session stats:', error);
    return {
      total: 0,
      active: 0,
      byRole: { admin: 0, seller: 0, user: 0 },
    };
  }
}

// Export for backward compatibility (but these won't work reliably in serverless)
export const sessionStore = {
  get: (sessionId: string) => {
    console.warn('Direct sessionStore access deprecated. Use getStoredSession() instead.');
    return sessionCache.get(sessionId)?.data;
  },
  set: (sessionId: string, data: SessionData) => {
    console.warn('Direct sessionStore access deprecated. Use storeSession() instead.');
    storeSession(sessionId, data);
  },
  delete: (sessionId: string) => {
    console.warn('Direct sessionStore access deprecated. Use deleteStoredSession() instead.');
    deleteStoredSession(sessionId);
  },
  entries: () => {
    console.warn('Direct sessionStore.entries() deprecated. Use getAllActiveSessions() instead.');
    return sessionCache.entries();
  },
};
