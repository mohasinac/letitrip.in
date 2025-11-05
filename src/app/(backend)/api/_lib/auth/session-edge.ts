/**
 * Edge-Compatible Session Functions
 * Used in middleware.ts which runs on Edge Runtime
 * 
 * Location: src/app/(backend)/api/_lib/auth/session-edge.ts
 */

import { sessionStore, SESSION_COOKIE_NAME, SESSION_MAX_AGE, type SessionData } from './session-store';

export type { SessionData };

/**
 * Get session from request (Edge-compatible)
 * Used in middleware.ts where Edge Runtime is used
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

// Export session store for sharing with session.ts
export { sessionStore };
