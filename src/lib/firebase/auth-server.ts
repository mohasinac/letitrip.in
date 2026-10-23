import { normalizeError } from "@mohasinac/appkit/errors/normalize";
import { isAccountDisabled } from "@mohasinac/appkit/features/auth/role-predicates";
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
import { getUserFromRequest as _getUserFromRequest, requireAuthFromRequest as _requireAuthFromRequest, requireRoleFromRequest as _requireRoleFromRequest, verifySessionCookie } from "@mohasinac/appkit/providers/auth-firebase/helpers";
import { userRepository } from "@mohasinac/appkit/features/auth/repository/user.repository";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";
import type { UserRole } from "@mohasinac/appkit";
import type { SessionUser } from "@mohasinac/appkit/react/contexts/SessionContext";
import type { UserDocument } from "@mohasinac/appkit/features/auth/schemas/firestore";

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
      /*
       * 🛑 REVEALED, and this is the widest fan-out of any reveal in the
       * codebase: `SessionUser` reaches every RSC and every `SessionContext`
       * consumer.
       *
       * It is the account holder reading their OWN record — the canonical
       * legitimate plaintext read. `findById` is ciphertext-by-default since
       * the PII sweep, so without this every surface that shows "your email"
       * or "your phone" rendered an `enc:v1:` blob, and every comparison
       * against them silently failed.
       */
      const profilePlain = userRepository.revealUser(profile);

      const sessionId = cookieStore.get("__session_id")?.value;

      return {
        uid: profile.uid,
        email: profilePlain.email,
        emailVerified: profile.emailVerified,
        displayName: profile.displayName,
        photoURL: profile.photoURL,
        phoneNumber: profilePlain.phoneNumber,
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
        /*
         * 🛑 `stats` is deliberately NOT carried on the server session.
         *
         * It used to forward `profile.stats`, which has no writer anywhere and
         * is therefore whatever the seed hardcoded. Nothing read it from here
         * either: `SessionProvider` mounts `initialUser={null}` so the root
         * layout stays static, so the client always refetches
         * `/api/user/profile` — which now DERIVES the counts. Forwarding a
         * fiction that only loses a race against the truth is strictly worse
         * than omitting it.
         *
         * Deriving it here instead was considered and rejected: this runs in
         * the admin and store layouts, i.e. on all 238 dashboard routes, and
         * three aggregations per request there buys nothing the client fetch
         * does not already provide.
         */
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
