/**
 * Session Management
 * Server-side session handling with HTTP-only cookies
 * Uses Firestore for persistent storage (Vercel-compatible)
 * 
 * Location: src/app/(backend)/api/_lib/auth/session.ts
 * Following backend architecture conventions
 */

import { cookies } from 'next/headers';
import { AUTH_CONSTANTS } from '@/constants/app';
import {
  storeSession,
  getStoredSession,
  updateStoredSession,
  deleteStoredSession,
  deleteUserSessions as deleteUserSessionsFromStore,
  getAllActiveSessions,
  getSessionStats as getSessionStatsFromStore,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
  type SessionData,
} from './session-store';

export type { SessionData };

/**
 * Generate a secure session ID using Web Crypto API (Edge-compatible)
 */
function generateSessionId(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Create a new session
 * Called after successful login/registration
 */
export async function createSession(userId: string, email: string, role: 'admin' | 'seller' | 'user'): Promise<string> {
  const sessionId = generateSessionId();
  const now = Date.now();
  
  const sessionData: SessionData = {
    userId,
    email,
    role,
    createdAt: now,
    expiresAt: now + (SESSION_MAX_AGE * 1000),
    lastActivity: now,
  };
  
  // Store session in Firestore (persistent)
  await storeSession(sessionId, sessionData);
  
  // Set HTTP-only cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true, // Cannot be accessed by JavaScript (XSS protection)
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'lax', // CSRF protection
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
  
  return sessionId;
}

/**
 * Get session data from HTTP-only cookie
 * Used in API routes with await cookies()
 */
export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    
    if (!sessionId) {
      return null;
    }
    
    // Get session from Firestore (with caching)
    const session = await getStoredSession(sessionId);
    
    if (!session) {
      return null;
    }
    
    // Check if session is expired
    const now = Date.now();
    if (session.expiresAt < now) {
      await deleteStoredSession(sessionId);
      await destroySession();
      return null;
    }
    
    // Update last activity (session sliding expiration)
    // Only update if last activity is older than threshold (reduce writes)
    if (now - session.lastActivity > AUTH_CONSTANTS.SESSION_ACTIVITY_UPDATE_THRESHOLD_MS) {
      await updateStoredSession(sessionId, {
        lastActivity: now,
        expiresAt: now + (SESSION_MAX_AGE * 1000),
      });
    }
    
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Get session from request (for middleware - synchronous read only)
 * Note: In serverless, this uses the in-memory cache only (fast but may miss)
 * For accurate reads, use getSession() in API routes
 */
export function getSessionFromRequest(request: Request): SessionData | null {
  try {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return null;
    }
    
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(cookie => {
        const [name, ...rest] = cookie.trim().split('=');
        return [name, rest.join('=')];
      })
    );
    
    const sessionId = cookies[SESSION_COOKIE_NAME];
    if (!sessionId) {
      return null;
    }
    
    // Note: This only checks the cache, not Firestore (middleware must be fast)
    // This means recently created sessions might not be visible in middleware
    // For full accuracy, the client should retry or use API routes
    const cached = (getStoredSession as any).cache?.get(sessionId);
    if (cached && Date.now() - cached.cachedAt < AUTH_CONSTANTS.CACHE_TTL_MS) {
      if (cached.data.expiresAt > Date.now()) {
        return cached.data;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting session from request:', error);
    return null;
  }
}

/**
 * Update session data
 */
export async function updateSession(updates: Partial<Omit<SessionData, 'userId' | 'createdAt'>>): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    
    if (!sessionId) {
      return false;
    }
    
    // Update in Firestore
    return await updateStoredSession(sessionId, {
      ...updates,
      lastActivity: Date.now(),
    });
  } catch (error) {
    console.error('Error updating session:', error);
    return false;
  }
}

/**
 * Destroy session and clear cookie
 * Called on logout
 */
export async function destroySession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    
    if (sessionId) {
      await deleteStoredSession(sessionId);
    }
    
    // Clear cookie
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch (error) {
    console.error('Error destroying session:', error);
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}

/**
 * Require authentication (throw if not authenticated)
 */
export async function requireAuth(): Promise<SessionData> {
  const session = await getSession();
  
  if (!session) {
    throw new Error('Authentication required');
  }
  
  return session;
}

/**
 * Require specific role
 */
export async function requireRole(roles: string | string[]): Promise<SessionData> {
  const session = await requireAuth();
  
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  if (!allowedRoles.includes(session.role)) {
    throw new Error('Insufficient permissions');
  }
  
  return session;
}

/**
 * Get all active sessions (admin only)
 */
export async function getAllSessions(): Promise<Array<SessionData & { sessionId: string }>> {
  return await getAllActiveSessions();
}

/**
 * Destroy specific session (admin only)
 */
export async function destroySessionById(sessionId: string): Promise<boolean> {
  await deleteStoredSession(sessionId);
  return true;
}

/**
 * Destroy all sessions for a user (e.g., on password change)
 */
export async function destroyUserSessions(userId: string): Promise<number> {
  return await deleteUserSessionsFromStore(userId);
}

/**
 * Get session statistics (admin dashboard)
 */
export async function getSessionStats() {
  return await getSessionStatsFromStore();
}
