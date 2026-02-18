/**
 * API Route: Admin Users Management
 * GET /api/admin/users - List users with search, role filter, disabled filter
 */

import { NextRequest } from "next/server";
import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
import { getSearchParams } from "@/lib/api/request-helpers";
import { userRepository } from "@/repositories";
import { applySieveToArray } from "@/helpers";
import { serverLogger } from "@/lib/server-logger";
import type { UserDocument } from "@/db/schema";

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

    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = Math.min(
      parseInt(searchParams.get("pageSize") || "100", 10),
      500,
    );
    const filters = searchParams.get("filters") || undefined;
    const sorts = searchParams.get("sorts") || "-createdAt";

    serverLogger.info("Admin users list requested", {
      filters,
      sorts,
      page,
      pageSize,
    });

    const users: UserDocument[] = await userRepository.findAll();

    const sieveResult = await applySieveToArray({
      items: users,
      model: {
        filters,
        sorts,
        page,
        pageSize,
      },
      fields: {
        uid: { canFilter: true, canSort: false },
        email: { canFilter: true, canSort: false },
        displayName: { canFilter: true, canSort: false },
        role: { canFilter: true, canSort: true },
        disabled: {
          canFilter: true,
          canSort: true,
          parseValue: (value: string) => value === "true",
        },
        createdAt: {
          canFilter: true,
          canSort: true,
          parseValue: (value: string) => new Date(value),
        },
      },
      options: {
        defaultPageSize: 100,
        maxPageSize: 500,
        throwExceptions: false,
      },
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
