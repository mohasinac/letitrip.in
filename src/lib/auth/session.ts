/**
 * Session Management
 * Server-side session handling with HTTP-only cookies
 */

import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';

// Session configuration
const SESSION_COOKIE_NAME = 'session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

export interface SessionData {
  userId: string;
  email: string;
  role: 'admin' | 'seller' | 'user';
  createdAt: number;
  expiresAt: number;
  lastActivity: number;
}

// In-memory session store (use Redis in production)
const sessionStore = new Map<string, SessionData>();

// Clean up expired sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of sessionStore.entries()) {
    if (session.expiresAt < now) {
      sessionStore.delete(sessionId);
    }
  }
}, 60 * 60 * 1000); // Clean up every hour

/**
 * Generate a secure session ID
 */
function generateSessionId(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Create a new session
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
  
  // Store session
  sessionStore.set(sessionId, sessionData);
  
  // Set HTTP-only cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
  
  return sessionId;
}

/**
 * Get session data from request
 */
export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    
    if (!sessionId) {
      return null;
    }
    
    const session = sessionStore.get(sessionId);
    
    if (!session) {
      return null;
    }
    
    // Check if session is expired
    const now = Date.now();
    if (session.expiresAt < now) {
      sessionStore.delete(sessionId);
      await destroySession();
      return null;
    }
    
    // Update last activity (session sliding expiration)
    session.lastActivity = now;
    session.expiresAt = now + (SESSION_MAX_AGE * 1000);
    
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Get session from request (for middleware)
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
    
    const session = sessionStore.get(sessionId);
    if (!session) {
      return null;
    }
    
    // Check if session is expired
    const now = Date.now();
    if (session.expiresAt < now) {
      sessionStore.delete(sessionId);
      return null;
    }
    
    // Update last activity
    session.lastActivity = now;
    session.expiresAt = now + (SESSION_MAX_AGE * 1000);
    
    return session;
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
    
    const session = sessionStore.get(sessionId);
    if (!session) {
      return false;
    }
    
    // Update session
    Object.assign(session, updates);
    session.lastActivity = Date.now();
    
    return true;
  } catch (error) {
    console.error('Error updating session:', error);
    return false;
  }
}

/**
 * Destroy session and clear cookie
 */
export async function destroySession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    
    if (sessionId) {
      sessionStore.delete(sessionId);
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
export function getAllSessions(): Array<SessionData & { sessionId: string }> {
  return Array.from(sessionStore.entries()).map(([sessionId, session]) => ({
    sessionId,
    ...session,
  }));
}

/**
 * Destroy specific session (admin only)
 */
export function destroySessionById(sessionId: string): boolean {
  return sessionStore.delete(sessionId);
}

/**
 * Destroy all sessions for a user (e.g., on password change)
 */
export function destroyUserSessions(userId: string): number {
  let count = 0;
  for (const [sessionId, session] of sessionStore.entries()) {
    if (session.userId === userId) {
      sessionStore.delete(sessionId);
      count++;
    }
  }
  return count;
}
