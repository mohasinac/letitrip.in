import { normalizeError } from "@mohasinac/appkit";
import { withProviders } from "@/providers.config";
/**
 * Admin Sessions API Route
 * GET /api/admin/sessions
 *
 * Fetch all active/expired sessions for admin dashboard.
 * Supports filtering by userId and limiting results.
 */

import { getAdminAuth } from "@mohasinac/appkit";

import { SUCCESS_MESSAGES } from "@mohasinac/appkit";
import { successResponse } from "@mohasinac/appkit";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@mohasinac/appkit";
import { sessionRepository } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { createApiHandler as createRouteHandler } from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

export const GET = withProviders(createRouteHandler({
  roles: [...ROLES_ADMIN_MOD],
  permission: "admin:sessions:read",
  handler: async ({ request }) => {
    const searchParams = getSearchParams(request);
    const userId = getStringParam(searchParams, "userId");
    const limit = getNumberParam(searchParams, "limit", 100, {
      min: 1,
      max: 1000,
    });

    const { sessions: rawSessions, stats } =
      await sessionRepository.findAllForAdmin({
        userId: userId || undefined,
        limit,
      });

    const userIds = new Set<string>();
    const sessions = rawSessions.map((s) => {
      userIds.add(s.userId);
      return {
        id: s.id,
        userId: s.userId,
        deviceInfo: s.deviceInfo,
        location: s.location,
        isActive: s.isActive,
        revokedAt: s.revokedAt,
        revokedBy: s.revokedBy,
        createdAt:
          s.createdAt instanceof Date
            ? s.createdAt.toISOString()
            : (s.createdAt as any)?.toDate?.().toISOString(),
        lastActivity:
          s.lastActivity instanceof Date
            ? s.lastActivity.toISOString()
            : (s.lastActivity as any)?.toDate?.().toISOString(),
        expiresAt:
          s.expiresAt instanceof Date
            ? s.expiresAt.toISOString()
            : (s.expiresAt as any)?.toDate?.().toISOString(),
        user: null as any,
      };
    });

    // Enrich sessions with Firebase Auth user details — parallelized (was a
    // sequential await-per-uid loop, a Rule #6 N+1 timeout risk as the
    // distinct-user count in the session list grows).
    const auth = getAdminAuth();
    const uniqueUids = Array.from(userIds);
    const userRecords = await Promise.all(
      uniqueUids.map((uid) =>
        auth.getUser(uid).catch((error: unknown) => {
          void normalizeError(error);
          serverLogger.warn(`Failed to fetch user ${uid}`, { error });
          return null;
        }),
      ),
    );
    const userMap = new Map<string, any>();
    uniqueUids.forEach((uid, i) => {
      const userRecord = userRecords[i];
      userMap.set(
        uid,
        userRecord
          ? {
              uid: userRecord.uid,
              email: userRecord.email || null,
              displayName: userRecord.displayName || null,
              role: userRecord.customClaims?.role || "user",
            }
          : { uid, email: null, displayName: "Unknown User", role: "user" },
      );
    });

    sessions.forEach((session) => {
      session.user = userMap.get(session.userId) || null;
    });

    return successResponse(
      { sessions, stats, count: sessions.length },
      SUCCESS_MESSAGES.SESSION.FETCHED,
    );
  },
}));

