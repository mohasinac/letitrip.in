/**
 * Auth Module Exports
 * Central export point for backend authentication utilities
 * 
 * Location: src/app/(backend)/api/_lib/auth/index.ts
 */

// Session management (server-side with Edge-compatible crypto)
export {
  createSession,
  getSession,
  getSessionFromRequest,
  destroySession,
  updateSession,
  isAuthenticated,
  requireAuth,
  requireRole,
  getAllSessions,
  destroySessionById,
  destroyUserSessions,
  getSessionStats,
  type SessionData,
} from './session';

// Session middleware (API routes)
export {
  withSessionAuth,
  verifySession,
  requireAuthentication,
  requireAdmin,
  requireSeller,
  type AuthMiddlewareOptions,
} from './session-middleware';

// Existing auth utilities (can be gradually phased out)
export * from './firebase-api-auth';
export * from './jwt';
export * from './middleware';
export * from './roles';
