/**
 * Manual Jest mock for src/lib/firebase/auth-server.ts
 *
 * Prevents the firebase-admin ESM chain from loading in test environments.
 */

export const verifyIdToken = jest.fn().mockResolvedValue(null);
export const verifySessionCookie = jest.fn().mockResolvedValue(null);
export const getAuthenticatedUser = jest.fn().mockResolvedValue(null);
export const requireAuth = jest
  .fn()
  .mockRejectedValue(new Error("Unauthenticated"));
export const requireRole = jest.fn().mockRejectedValue(new Error("Forbidden"));
export const createSessionCookie = jest
  .fn()
  .mockResolvedValue("mock-session-cookie");
export const revokeUserTokens = jest.fn().mockResolvedValue(undefined);
export const getServerSessionUser = jest.fn().mockResolvedValue(null);

