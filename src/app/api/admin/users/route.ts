import { withProviders } from "@/providers.config";
import { SORT_DROPPED_FOR_EXACT_SEARCH, withDegraded } from "@mohasinac/appkit/errors/degraded";
/**
 * API Route: Admin Users Management
 * GET /api/admin/users - List users with search, role filter, disabled filter
 */

import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { getNumberParam, getSearchParams, getStringParam } from "@mohasinac/appkit/next/request-helpers";
import { userRepository } from "@mohasinac/appkit/features/auth/repository/user.repository";
import { piiBlindIndex } from "@mohasinac/appkit/server";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";
import { USER_FIELDS } from "@mohasinac/appkit/features/auth/schemas/firestore";
import { sortBy } from "@mohasinac/appkit/constants/sort";
import { ROLES_ADMIN_MOD } from "@/constants";

const DEFAULT_SORTS = sortBy(USER_FIELDS.CREATED_AT);

/**
 * GET /api/admin/users
 *
 * Query params:
 *  - filters  (string)  — Sieve filters
 *  - sorts    (string)  — Sieve sorts
 *  - page     (number)  — page number (default 1)
 *  - pageSize (number)  — max results per page (default 100)
 */
export const GET = withProviders(createRouteHandler({
  auth: true,
  roles: [...ROLES_ADMIN_MOD],
  handler: async ({ request }) => {
    const searchParams = getSearchParams(request);

    const page = getNumberParam(searchParams, "page", 1, { min: 1 });
    const pageSize = getNumberParam(searchParams, "pageSize", 50, {
      min: 1,
      max: 50,
    });
    const filters = getStringParam(searchParams, "filters");
    const sorts = getStringParam(searchParams, "sorts") || DEFAULT_SORTS;
    const q = getStringParam(searchParams, "q")?.trim() || "";

    serverLogger.info("Admin users list requested", {
      filters,
      sorts,
      page,
      pageSize,
      q: q ? "[redacted]" : "",
    });

    // Email remains encrypted (blind index lookup). displayName is now plain text.
    const qFilter = q
      ? q.includes("@")
        ? `${USER_FIELDS.EMAIL_INDEX}==${piiBlindIndex(q)}`
        : `${USER_FIELDS.DISPLAY_NAME}==${q}`
      : undefined;

    const effectiveFilters =
      [filters, qFilter].filter(Boolean).join(",") || undefined;

    // The sort is genuinely unavailable here: `q` resolves through an HMAC
    // blind index or an exact name match, and preserving the caller's sort
    // across these three endpoints was MEASURED at 14 more composite indexes
    // — to order a set an exact email match bounds at one row. Dropping it is
    // the right trade. Dropping it silently was not: the sort dropdown went on
    // displaying "Oldest" over unsorted rows, so the compromise now travels on
    // the response.
    const effectiveSorts = q ? undefined : sorts;
    const degraded = q ? [SORT_DROPPED_FOR_EXACT_SEARCH] : [];

    const serializeUser = (
      u: Awaited<ReturnType<typeof userRepository.list>>["items"][number],
    ) => ({
      id: u.id || u.uid,
      uid: u.uid,
      email: u.email,
      displayName: u.displayName,
      photoURL: u.photoURL,
      role: u.role,
      emailVerified: u.emailVerified,
      disabled: u.disabled,
      [USER_FIELDS.IS_TESTER]: Boolean(u.isTester),
      [USER_FIELDS.CAN_TEST_ADMIN]: Boolean(u.canTestAdmin),
      createdAt:
        u.createdAt instanceof Date
          ? u.createdAt.toISOString()
          : ((u.createdAt as any)?.toDate?.()?.toISOString() ??
            String(u.createdAt)),
      lastLoginAt:
        (u.metadata as any)?.lastSignInTime instanceof Date
          ? (u.metadata as any).lastSignInTime.toISOString()
          : ((u.metadata as any)?.lastSignInTime as any)?.toDate?.()?.toISOString() ??
            (u.metadata as any)?.lastSignInTime,
      metadata: u.metadata ? { loginCount: (u.metadata as any).loginCount } : undefined,
    });

    const sieveResult = await userRepository.list({
      filters: effectiveFilters,
      sorts: effectiveSorts,
      page,
      pageSize,
    });

    return successResponse(withDegraded({
      items: sieveResult.items.map(serializeUser),
      total: sieveResult.total,
      meta: {
        page: sieveResult.page,
        pageSize: sieveResult.pageSize,
        total: sieveResult.total,
        totalPages: sieveResult.totalPages,
        hasMore: sieveResult.hasMore,
      },
    }, degraded));
  },
}));

