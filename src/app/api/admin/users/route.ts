import "@/providers.config";
/**
 * API Route: Admin Users Management
 * GET /api/admin/users - List users with search, role filter, disabled filter
 */

import { createApiHandler as createRouteHandler } from "@/lib/api/api-handler";
import { successResponse } from "@mohasinac/appkit/next";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@mohasinac/appkit/next";
import { buildSieveFilters } from "@mohasinac/appkit/utils";
import { userRepository } from "@/repositories";
import { piiBlindIndex } from "@/lib/pii";
import { serverLogger } from "@/lib/server-logger";
import { USER_FIELDS } from "@/db/schema";

/**
 * GET /api/admin/users
 *
 * Query params:
 *  - filters  (string)  — Sieve filters
 *  - sorts    (string)  — Sieve sorts
 *  - page     (number)  — page number (default 1)
 *  - pageSize (number)  — max results per page (default 100)
 */
export const GET = createRouteHandler({
  auth: true,
  roles: ["admin", "moderator"],
  handler: async ({ request }) => {
    const searchParams = getSearchParams(request);

    const page = getNumberParam(searchParams, "page", 1, { min: 1 });
    const pageSize = getNumberParam(searchParams, "pageSize", 100, {
      min: 1,
      max: 500,
    });
    const filters = getStringParam(searchParams, "filters");
    const sorts = getStringParam(searchParams, "sorts") || "-createdAt";
    const q = getStringParam(searchParams, "q")?.trim() || "";

    serverLogger.info("Admin users list requested", {
      filters,
      sorts,
      page,
      pageSize,
      q: q ? "[redacted]" : "",
    });

    // PII fields are encrypted, so `q` is translated into blind-index equality
    // filters to keep the entire list path query-level (no in-memory filtering).
    const qFilter = q
      ? q.includes("@")
        ? `${USER_FIELDS.EMAIL_INDEX}==${piiBlindIndex(q)}`
        : `${USER_FIELDS.DISPLAY_NAME_INDEX}==${piiBlindIndex(q)}`
      : undefined;

    const effectiveFilters =
      buildSieveFilters(["", filters], ["", qFilter]) || undefined;

    // Avoid forcing extra composite indices for exact blind-index lookups.
    const effectiveSorts = q ? undefined : sorts;

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
      createdAt:
        u.createdAt instanceof Date
          ? u.createdAt.toISOString()
          : ((u.createdAt as any)?.toDate?.()?.toISOString() ??
            String(u.createdAt)),
      lastLoginAt:
        u.metadata?.lastSignInTime instanceof Date
          ? u.metadata.lastSignInTime.toISOString()
          : ((u.metadata?.lastSignInTime as any)?.toDate?.()?.toISOString() ??
            u.metadata?.lastSignInTime),
      metadata: u.metadata ? { loginCount: u.metadata.loginCount } : undefined,
    });

    const sieveResult = await userRepository.list({
      filters: effectiveFilters,
      sorts: effectiveSorts,
      page,
      pageSize,
    });

    return successResponse({
      users: sieveResult.items.map(serializeUser),
      total: sieveResult.total,
      meta: {
        page: sieveResult.page,
        pageSize: sieveResult.pageSize,
        total: sieveResult.total,
        totalPages: sieveResult.totalPages,
        hasMore: sieveResult.hasMore,
      },
    });
  },
});
