/**
 * API Route: Admin Users Management
 * GET /api/admin/users - List users with search, role filter, disabled filter
 */

import { NextRequest } from "next/server";
import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
import { userRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
import type { UserDocument } from "@/db/schema";
import type { UserRole } from "@/types/auth";

/**
 * GET /api/admin/users
 *
 * Query params:
 *  - search   (string)  — partial match on displayName or email
 *  - role     (string)  — filter by role (admin, moderator, seller, user)
 *  - disabled (boolean) — filter by disabled status ("true"/"false")
 *  - limit    (number)  — max results, default 100
 *  - offset   (number)  — pagination offset, default 0
 */
export const GET = createApiHandler({
  auth: true,
  roles: ["admin", "moderator"],
  handler: async ({ request }: { request: NextRequest }) => {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const roleFilter = searchParams.get("role") || "";
    const disabledParam = searchParams.get("disabled");
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "100", 10),
      500,
    );
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    serverLogger.info("Admin users list requested", {
      search,
      roleFilter,
      disabledParam,
      limit,
      offset,
    });

    // Fetch users using available repository methods
    let users: UserDocument[];

    if (roleFilter && roleFilter !== "all") {
      users = await userRepository.findByRole(roleFilter as UserRole);
    } else if (disabledParam === "true") {
      // Fetch all and filter disabled (repo doesn't have findDisabled with no limit)
      const all = await userRepository.findAll();
      users = all.filter((u) => u.disabled);
    } else if (disabledParam === "false") {
      users = await userRepository.findActive();
    } else {
      users = await userRepository.findAll();
    }

    // Apply search filter (displayName or email)
    if (search) {
      users = users.filter(
        (u) =>
          u.displayName?.toLowerCase().includes(search) ||
          u.email?.toLowerCase().includes(search) ||
          u.uid.toLowerCase().includes(search),
      );
    }

    const total = users.length;

    // Sort: newest first
    users.sort((a, b) => {
      const dateA =
        a.createdAt instanceof Date
          ? a.createdAt.getTime()
          : new Date(a.createdAt as unknown as string).getTime();
      const dateB =
        b.createdAt instanceof Date
          ? b.createdAt.getTime()
          : new Date(b.createdAt as unknown as string).getTime();
      return dateB - dateA;
    });

    // Paginate
    const paginated = users.slice(offset, offset + limit);

    // Serialize dates and strip sensitive fields
    const serialized = paginated.map((u) => ({
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

    return successResponse({ users: serialized, total });
  },
});
