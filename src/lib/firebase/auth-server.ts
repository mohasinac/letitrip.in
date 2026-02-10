/**
 * Server-Side Firebase Auth Utilities
 *
 * Functions for verifying Firebase Auth tokens on the server.
 * Use these in API routes and server components.
 */

import { getAdminAuth } from "./admin";
import { cookies } from "next/headers";
import type { DecodedIdToken } from "firebase-admin/auth";
import { AuthenticationError, AuthorizationError } from "@/lib/errors";
import { ERROR_MESSAGES } from "@/constants";

/**
 * Verify Firebase ID token from request
 */
export async function verifyIdToken(
  token: string,
): Promise<DecodedIdToken | null> {
  try {
    const decodedToken = await getAdminAuth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

/**
 * Verify session cookie
 */
export async function verifySessionCookie(
  sessionCookie: string,
): Promise<DecodedIdToken | null> {
  try {
    const decodedClaims = await getAdminAuth().verifySessionCookie(
      sessionCookie,
      true,
    );
    return decodedClaims;
  } catch (error) {
    console.error("Session cookie verification failed:", error);
    return null;
  }
}

/**
 * Get authenticated user from cookies (server-side)
 */
export async function getAuthenticatedUser(): Promise<DecodedIdToken | null> {
  const cookieStore = await cookies();

  // Try session cookie first
  const sessionCookie = cookieStore.get("__session")?.value;
  if (sessionCookie) {
    const user = await verifySessionCookie(sessionCookie);
    if (user) return user;
  }

  // Fallback to ID token
  const idToken = cookieStore.get("idToken")?.value;
  if (idToken) {
    return await verifyIdToken(idToken);
  }

  return null;
}

/**
 * Require authentication (throws if not authenticated)
 */
export async function requireAuth(): Promise<DecodedIdToken> {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw new AuthenticationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
  }

  return user;
}

/**
 * Check if user has specific role
 */
export async function requireRole(
  role: string | string[],
): Promise<DecodedIdToken> {
  const user = await requireAuth();

  const roles = Array.isArray(role) ? role : [role];
  const userRole = user.role || "user";

  if (!roles.includes(userRole)) {
    throw new AuthorizationError(ERROR_MESSAGES.AUTH.INSUFFICIENT_PERMISSIONS);
  }

  return user;
}

/**
 * Create session cookie from ID token
 */
export async function createSessionCookie(
  idToken: string,
  expiresIn: number = 60 * 60 * 24 * 5 * 1000,
) {
  try {
    const sessionCookie = await getAdminAuth().createSessionCookie(idToken, {
      expiresIn,
    });
    return sessionCookie;
  } catch (error) {
    console.error("Failed to create session cookie:", error);
    throw error;
  }
}

/**
 * Revoke refresh tokens for user
 */
export async function revokeUserTokens(uid: string): Promise<void> {
  try {
    await getAdminAuth().revokeRefreshTokens(uid);
  } catch (error) {
    console.error("Failed to revoke tokens:", error);
    throw error;
  }
}
