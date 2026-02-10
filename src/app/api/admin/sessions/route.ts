/**
 * Admin Sessions API Route
 * GET /api/admin/sessions
 *
 * Fetch all active/expired sessions for admin dashboard
 * Supports filtering by userId and limiting results
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { ERROR_MESSAGES } from "@/constants";
import { AuthenticationError, AuthorizationError } from "@/lib/errors";
import { SESSION_COLLECTION, type SessionDocument } from "@/db/schema";

export async function GET(req: NextRequest) {
  try {
    // Verify admin session
    const sessionCookie = req.cookies.get("__session")?.value;
    if (!sessionCookie) {
      throw new AuthenticationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
    }

    const auth = getAdminAuth();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    // Check admin role
    if (decodedClaims.role !== "admin" && decodedClaims.role !== "moderator") {
      throw new AuthorizationError(ERROR_MESSAGES.AUTH.FORBIDDEN);
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const db = getAdminDb();
    let query = db
      .collection(SESSION_COLLECTION)
      .orderBy("lastActivity", "desc");

    // Filter by user if provided
    if (userId) {
      query = query.where("userId", "==", userId) as any;
    }

    // Apply limit
    if (limit > 0) {
      query = query.limit(limit) as any;
    }

    const snapshot = await query.get();
    const sessions: Array<
      Omit<SessionDocument, "createdAt" | "lastActivity" | "expiresAt"> & {
        createdAt: string;
        lastActivity: string;
        expiresAt: string;
        user: any;
      }
    > = [];
    const userIds = new Set<string>();
    let totalActive = 0;
    let totalExpired = 0;
    const now = Date.now();
    const fifteenMinutesAgo = now - 15 * 60 * 1000;

    for (const doc of snapshot.docs) {
      const sessionData = doc.data();
      const expiresAt = sessionData.expiresAt?.toMillis() || 0;
      const lastActivity = sessionData.lastActivity?.toMillis() || 0;
      const isExpired = expiresAt < now;
      const isActive = !isExpired && lastActivity > fifteenMinutesAgo;

      if (isExpired) {
        totalExpired++;
      } else {
        totalActive++;
      }

      userIds.add(sessionData.userId);

      sessions.push({
        id: doc.id,
        userId: sessionData.userId,
        deviceInfo: sessionData.deviceInfo,
        location: sessionData.location,
        isActive: sessionData.isActive,
        revokedAt: sessionData.revokedAt,
        revokedBy: sessionData.revokedBy,
        createdAt: sessionData.createdAt?.toDate().toISOString(),
        lastActivity: sessionData.lastActivity?.toDate().toISOString(),
        expiresAt: sessionData.expiresAt?.toDate().toISOString(),
        user: null, // Will be populated below
      });
    }

    // Fetch user details for all sessions
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
        console.error(`Failed to fetch user ${uid}:`, error);
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

    // Calculate recent activity (sessions active in last 15 minutes)
    const recentActivity = sessions.filter((s) => {
      const lastActivity = new Date(s.lastActivity).getTime();
      return lastActivity > fifteenMinutesAgo;
    }).length;

    return NextResponse.json({
      success: true,
      sessions,
      stats: {
        totalActive,
        totalExpired,
        uniqueUsers: uniqueUserIds.length,
        recentActivity,
      },
      count: sessions.length,
    });
  } catch (error) {
    console.error("Admin sessions fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch sessions",
      },
      { status: 500 },
    );
  }
}
