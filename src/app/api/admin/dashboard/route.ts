/**
 * API Route: Admin Dashboard Statistics
 * GET /api/admin/dashboard
 *
 * Returns statistics for admin dashboard:
 * - Total users, active users, new users (last 30 days)
 * - Total trips, bookings
 * - Recent activity
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/firebase/auth-server";
import { requireRole } from "@/lib/security/authorization";
import { handleApiError } from "@/lib/errors";
import {
  collection,
  getCountFromServer,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { USER_COLLECTION } from "@/db/schema/users";

export async function GET(request: NextRequest) {
  try {
    // Authenticate and authorize
    const user = await getAuthenticatedUser();
    requireRole(user, ["admin", "moderator"]);

    // Get date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get statistics in parallel
    const [
      totalUsersSnapshot,
      activeUsersSnapshot,
      newUsersSnapshot,
      disabledUsersSnapshot,
      adminUsersSnapshot,
      tripsSnapshot,
      bookingsSnapshot,
    ] = await Promise.all([
      // Total users
      getCountFromServer(collection(db, USER_COLLECTION)),

      // Active users (not disabled)
      getCountFromServer(
        query(collection(db, USER_COLLECTION), where("disabled", "==", false)),
      ),

      // New users (last 30 days)
      getCountFromServer(
        query(
          collection(db, USER_COLLECTION),
          where("createdAt", ">=", thirtyDaysAgo),
        ),
      ),

      // Disabled users
      getCountFromServer(
        query(collection(db, USER_COLLECTION), where("disabled", "==", true)),
      ),

      // Admin users
      getCountFromServer(
        query(collection(db, USER_COLLECTION), where("role", "==", "admin")),
      ),

      // Trips (if collection exists)
      getCountFromServer(collection(db, "trips")).catch(() => ({
        data: () => ({ count: 0 }),
      })),

      // Bookings (if collection exists)
      getCountFromServer(collection(db, "bookings")).catch(() => ({
        data: () => ({ count: 0 }),
      })),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        users: {
          total: totalUsersSnapshot.data().count,
          active: activeUsersSnapshot.data().count,
          newThisMonth: newUsersSnapshot.data().count,
          disabled: disabledUsersSnapshot.data().count,
          admins: adminUsersSnapshot.data().count,
        },
        trips: {
          total: tripsSnapshot.data().count,
        },
        bookings: {
          total: bookingsSnapshot.data().count,
        },
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
