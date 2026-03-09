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
import { serverLogger } from "@/lib/server-logger";
import type { SessionUser } from "@/types/auth";

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
    serverLogger.error("Token verification failed:", error);
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
    serverLogger.error("Session cookie verification failed:", error);
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
    serverLogger.error("Failed to create session cookie:", error);
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
    serverLogger.error("Failed to revoke tokens:", error);
    throw error;
  }
}

/**
 * Read and verify the __session cookie server-side and return a hydrated
 * SessionUser suitable for passing as initialUser to SessionProvider.
 *
 * Returns null if the cookie is absent, expired, or if the Firestore profile
 * cannot be retrieved — the client will fall back to onAuthStateChanged.
 */
export async function getServerSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("__session")?.value;
    if (!sessionCookie) return null;

    const decoded = await verifySessionCookie(sessionCookie);
    if (!decoded) return null;

    // Lazy-import the repository to avoid bloating every module that imports
    // auth-server.ts (repository pulls in the full Admin SDK chain).
    const { userRepository } = await import("@/repositories");
    const profile = await userRepository.findById(decoded.uid);
    if (!profile) return null;

    const sessionId = cookieStore.get("__session_id")?.value;

    return {
      uid: profile.uid,
      email: profile.email,
      emailVerified: profile.emailVerified,
      displayName: profile.displayName,
      photoURL: profile.photoURL,
      phoneNumber: profile.phoneNumber,
      role: profile.role,
      disabled: profile.disabled,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      sessionId: sessionId ?? undefined,
      phoneVerified: profile.phoneVerified,
      avatarMetadata: profile.avatarMetadata ?? null,
      publicProfile: profile.publicProfile
        ? {
            isPublic: profile.publicProfile.isPublic,
            showEmail: profile.publicProfile.showEmail,
            showPhone: profile.publicProfile.showPhone,
            showOrders: profile.publicProfile.showOrders,
            showWishlist: profile.publicProfile.showWishlist,
            bio: profile.publicProfile.bio,
            location: profile.publicProfile.location,
            website: profile.publicProfile.website,
            socialLinks: profile.publicProfile.socialLinks,
          }
        : undefined,
      stats: profile.stats
        ? {
            totalOrders: profile.stats.totalOrders,
            auctionsWon: profile.stats.auctionsWon,
            itemsSold: profile.stats.itemsSold,
            reviewsCount: profile.stats.reviewsCount,
            rating: profile.stats.rating,
          }
        : undefined,
      metadata: profile.metadata
        ? {
            lastSignInTime: profile.metadata.lastSignInTime
              ? String(profile.metadata.lastSignInTime)
              : undefined,
            creationTime: profile.metadata.creationTime,
            loginCount: profile.metadata.loginCount,
          }
        : undefined,
    };
  } catch (error) {
    serverLogger.debug("getServerSessionUser: could not resolve session", {
      error,
    });
    return null;
  }
}
