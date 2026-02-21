/**
 * API Route: Admin Users Management
 * GET /api/admin/users - List users with search, role filter, disabled filter
 */

import { NextRequest } from "next/server";
import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@/lib/api/request-helpers";
import { userRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";

/**
 * GET /api/admin/users
 *
 * Query params:
 *  - filters  (string)  — Sieve filters
 *  - sorts    (string)  — Sieve sorts
 *  - page     (number)  — page number (default 1)
 *  - pageSize (number)  — max results per page (default 100)
 */
export const GET = createApiHandler({
  auth: true,
  roles: ["admin", "moderator"],
  handler: async ({ request }: { request: NextRequest }) => {
    const searchParams = getSearchParams(request);

    const page = getNumberParam(searchParams, "page", 1, { min: 1 });
    const pageSize = getNumberParam(searchParams, "pageSize", 100, {
      min: 1,
      max: 500,
    });
    const filters = getStringParam(searchParams, "filters");
    const sorts = getStringParam(searchParams, "sorts") || "-createdAt";

    serverLogger.info("Admin users list requested", {
      filters,
      sorts,
      page,
      pageSize,
    });

    const sieveResult = await userRepository.list({
      filters,
      sorts,
      page,
      pageSize,
    });

    // Serialize dates and strip sensitive fields
    const serialized = sieveResult.items.map((u) => ({
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
    }));

    return successResponse({
      users: serialized,
      total: sieveResult.total,
      meta: {
        page: sieveResult.page,
        limit: sieveResult.pageSize,
        total: sieveResult.total,
        totalPages: sieveResult.totalPages,
        hasMore: sieveResult.hasMore,
      },
    });
  },
});
