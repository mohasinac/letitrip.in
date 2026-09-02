import { normalizeError } from "@mohasinac/appkit";
import { isAccountDisabled } from "@mohasinac/appkit";
/**
 * letitrip auth-server adapter
 *
 * Thin consumer-specific wrappers around @mohasinac/appkit/providers/auth-firebase.
 * All generic functions (verifyIdToken, requireAuthUser, requireRoleUser, etc.)
 * should be imported directly from appkit.
 *
 * This file only exports:
 *   - getUserFromRequest  � returns UserDocument (binds userRepository)
 *   - requireAuthFromRequest � same with auth guard
 *   - requireRoleFromRequest � same with role guard
 *   - getServerSessionUser   � returns letitrip SessionUser (RSC helper)
 */
import { cookies } from "next/headers";
import { cache } from "react";
import type { NextRequest } from "next/server";
import {
  getUserFromRequest as _getUserFromRequest,
  requireAuthFromRequest as _requireAuthFromRequest,
  requireRoleFromRequest as _requireRoleFromRequest,
  verifySessionCookie,
} from "@mohasinac/appkit";
import { userRepository } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import type { UserRole } from "@mohasinac/appkit";
import type { SessionUser } from "@mohasinac/appkit";
import type { UserDocument } from "@mohasinac/appkit";

async function findUserById(uid: string): Promise<UserDocument | null> {
  return userRepository.findById(uid) as Promise<UserDocument | null>;
}

/** Get the authenticated UserDocument from a request session cookie. */
export function getUserFromRequest(request: Request): Promise<UserDocument | null> {
  return _getUserFromRequest(request, findUserById);
}

/** Require authentication � returns UserDocument or throws 401. */
export function requireAuthFromRequest(request: Request): Promise<UserDocument> {
  return _requireAuthFromRequest(
    request,
    findUserById,
    (u: UserDocument) => isAccountDisabled(u),
  );
}

/** Require a role � returns UserDocument or throws 401/403. */
export function requireRoleFromRequest(
  request: Request | NextRequest,
  roles: UserRole | UserRole[],
): Promise<UserDocument> {
  return _requireRoleFromRequest(
    request as Request,
    findUserById,
    Array.isArray(roles) ? roles : [roles],
    (u: UserDocument) => u.role as string,
  );
}

/**
 * Read and verify the __session cookie server-side and return a hydrated
 * SessionUser suitable for passing as initialUser to SessionProvider.
 *
 * Wrapped with React cache() so multiple RSC callers in the same request
 * share a single Firebase Admin round-trip.
 */
export const getServerSessionUser = cache(
  async (): Promise<SessionUser | null> => {
    /*
     * 🛑 `cookies()` stays OUTSIDE the try, deliberately.
     *
     * During static prerendering it throws `DynamicServerError` — that throw is
     * Next's dynamic-bailout signal, not a "session could not be resolved" case.
     * The bailout itself survives being caught (`throwToInterruptStaticGeneration`
     * sets `prerenderStore.revalidate = 0` BEFORE throwing), so swallowing it does
     * not make a route static. What it does is worse and quieter: this function
     * returns `null`, and the very next line of `admin/layout.tsx` is
     * `if (!user) redirect(...)` — so a build-time prerender ran the layout's
     * redirect for all 134 admin routes. Nothing below the layout can catch that;
     * it is thrown above `{children}`, which is why adding a page-level <Suspense>
     * appeared not to help and led to ~200 pages being marked force-dynamic.
     *
     * At runtime `cookies()` never throws, so this changes no request behaviour.
     * The only other things it throws for — being called inside `after()`,
     * `use cache`, or `generateStaticParams` — are misuse that should be loud.
     */
    const cookieStore = await cookies();
    try {
      const sessionCookie = cookieStore.get("__session")?.value;
      if (!sessionCookie) return null;

      const decoded = await verifySessionCookie(sessionCookie);
      if (!decoded) return null;

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
        storeId: profile.storeId,
        isTester: profile.isTester,
        canTestAdmin: profile.canTestAdmin,
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
        dismissedBannerHash: profile.dismissedBannerHash,
      };
    } catch (error) {
      void normalizeError(error);
      serverLogger.debug("getServerSessionUser: could not resolve session", { error });
      return null;
    }
  },
);
