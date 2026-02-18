/**
 * Admin Sessions API Route
 * GET /api/admin/sessions
 *
 * Fetch all active/expired sessions for admin dashboard
 * Supports filtering by userId and limiting results
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { errorResponse } from "@/lib/api-response";
import { AuthenticationError, AuthorizationError } from "@/lib/errors";
import {
  getNumberParam,
  getRequiredSessionCookie,
  getSearchParams,
  getStringParam,
} from "@/lib/api/request-helpers";
import { sessionRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";

export async function GET(req: NextRequest) {
  try {
    // Verify admin session
    const sessionCookie = getRequiredSessionCookie(req);

    const auth = getAdminAuth();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    // Check admin role
    if (decodedClaims.role !== "admin" && decodedClaims.role !== "moderator") {
      throw new AuthorizationError(ERROR_MESSAGES.AUTH.FORBIDDEN);
    }

    // Get query parameters
    const searchParams = getSearchParams(req);
    const userId = getStringParam(searchParams, "userId");
    const limit = getNumberParam(searchParams, "limit", 100, {
      min: 1,
      max: 1000,
    });

    // Fetch sessions and stats via repository
    const { sessions: rawSessions, stats } =
      await sessionRepository.findAllForAdmin({
        userId: userId || undefined,
        limit,
      });

    // Serialize sessions for JSON response
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

    // Fetch user details for all sessions from Auth
    const uniqueUserIds = Array.from(userIds);
    const userMap = new Map();

    for (const uid of uniqueUserIds) {
      try {
        const userRecord = await auth.getUser(uid);
        userMap.set(uid, {
          uid: userRecord.uid,
          email: userRecord.email || null,
          displayName: userRecord.displayName || null,
          role: userRecord.customClaims?.role || "user",
        });
      } catch (error) {
        serverLogger.warn(`Failed to fetch user ${uid}`, { error });
        userMap.set(uid, {
          uid,
          email: null,
          displayName: "Unknown User",
          role: "user",
        });
      }
    }

    // Attach user data to sessions
    sessions.forEach((session) => {
      session.user = userMap.get(session.userId) || null;
    });

    return NextResponse.json({
      success: true,
      sessions,
      stats,
      count: sessions.length,
    });
  } catch (error) {
    serverLogger.error(ERROR_MESSAGES.API.ADMIN_SESSIONS_ERROR, { error });
    return errorResponse(
      error instanceof Error
        ? error.message
        : ERROR_MESSAGES.SESSION.FETCH_FAILED,
      500,
    );
  }
}
