/**
 * Server-Side Firebase Auth Utilities
 *
 * Functions for verifying Firebase Auth tokens on the server.
 * Use these in API routes and server components.
 */

import { cookies } from "next/headers";
import { cache } from "react";
import type { DecodedIdToken } from "firebase-admin/auth";
import {
  AuthenticationError,
  AuthorizationError,
} from "@mohasinac/appkit/errors";
import { ERROR_MESSAGES } from "@/constants";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import type { SessionUser, UserRole } from "@/types/auth";
import type { NextRequest } from "next/server";
import type { UserDocument } from "@/db/schema/users";

// Lazy loader — (module as any).require() prevents webpack from tracing firebase-admin
// into the browser bundle when this file appears in the flight-action module graph.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getAdminAuth = () =>
  (
    (module as any).require(
      "@mohasinac/appkit/providers/db-firebase",
    ) as typeof import("@mohasinac/appkit/providers/db-firebase")
  ).getAdminAuth();

/** Firebase error codes that represent a normal "not authenticated" state. */
const EXPECTED_AUTH_CODES = new Set([
  "auth/argument-error",
  "auth/id-token-expired",
  "auth/id-token-revoked",
  "auth/session-cookie-expired",
  "auth/session-cookie-revoked",
  "auth/user-disabled",
  "auth/user-not-found",
]);

export async function verifyIdToken(
  token: string,
): Promise<DecodedIdToken | null> {
  try {
    const decodedToken = await getAdminAuth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    const code = (error as { code?: string }).code ?? "";
    if (!EXPECTED_AUTH_CODES.has(code)) {
      serverLogger.error("Token verification failed:", error);
    }
    return null;
  }
}

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
    const code = (error as { code?: string }).code ?? "";
    if (!EXPECTED_AUTH_CODES.has(code)) {
      serverLogger.error("Session cookie verification failed:", error);
    }
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

  // Custom claims may not contain role — fetch from Firestore as source of truth
  let userRole = (user.role as string | undefined) || undefined;
  if (!userRole) {
    const { userRepository } = await import("@mohasinac/appkit/repositories");
    const profile = await userRepository.findById(user.uid);
    userRole = profile?.role || "user";
  }

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
 *
 * Wrapped with React `cache()` so multiple callers within the same RSC request
 * (e.g. root layout + page component) share a single Firebase Admin round-trip.
 */
export const getServerSessionUser = cache(
  async (): Promise<SessionUser | null> => {
    try {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get("__session")?.value;
      if (!sessionCookie) return null;

      const decoded = await verifySessionCookie(sessionCookie);
      if (!decoded) return null;

      // Lazy-import the repository to avoid bloating every module that imports
      // auth-server.ts (repository pulls in the full Admin SDK chain).
      const { userRepository } = await import("@mohasinac/appkit/repositories");
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
  },
);

/**
 * Get the authenticated user from a NextRequest session cookie.
 * Returns null if unauthenticated or session is invalid.
 */
export async function getUserFromRequest(
  request: Request,
): Promise<UserDocument | null> {
  try {
    let sessionCookie: string | undefined;
    if ("cookies" in request && typeof (request as NextRequest).cookies?.get === "function") {
      sessionCookie = (request as NextRequest).cookies.get("__session")?.value;
    } else {
      const cookieHeader = request.headers.get("cookie") ?? "";
      const match = cookieHeader.match(/(?:^|;\s*)__session=([^;]*)/);
      sessionCookie = match?.[1];
    }
    if (!sessionCookie) return null;

    const decodedToken = await verifySessionCookie(sessionCookie);
    if (!decodedToken) return null;

    const { userRepository } = await import("@mohasinac/appkit/repositories");
    return await userRepository.findById(decodedToken.uid);
  } catch {
    return null;
  }
}

/**
 * Require authenticated user from a NextRequest.
 * Throws AuthenticationError if unauthenticated or account is disabled.
 */
export async function requireAuthFromRequest(
  request: Request,
): Promise<UserDocument> {
  const user = await getUserFromRequest(request);
  if (!user) {
    throw new AuthenticationError(ERROR_MESSAGES.USER.NOT_AUTHENTICATED);
  }
  if (user.disabled) {
    throw new AuthenticationError(ERROR_MESSAGES.AUTH.ACCOUNT_DISABLED);
  }
  return user;
}

/**
 * Require a specific role from a NextRequest.
 * Throws AuthorizationError if the user lacks the required role.
 */
export async function requireRoleFromRequest(
  request: NextRequest,
  roles: UserRole | UserRole[],
): Promise<UserDocument> {
  const user = await requireAuthFromRequest(request);
  const requiredRoles = Array.isArray(roles) ? roles : [roles];
  if (!requiredRoles.includes(user.role as UserRole)) {
    throw new AuthorizationError(ERROR_MESSAGES.AUTH.FORBIDDEN);
  }
  return user;
}

