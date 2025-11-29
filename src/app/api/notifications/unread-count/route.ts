/**
 * Notifications Unread Count API
 * Epic: E033 - Live Header Data
 *
 * GET /api/notifications/unread-count - Get unread notification count
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/app/api/lib/auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

/**
 * GET /api/notifications/unread-count
 * Returns the count of unread notifications
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);

    if (!auth.user) {
      return NextResponse.json({
        success: true,
        data: { count: 0 },
      });
    }

    const db = getFirestoreAdmin();
    const countSnapshot = await db
      .collection(COLLECTIONS.NOTIFICATIONS)
      .where("user_id", "==", auth.user.uid)
      .where("read", "==", false)
      .count()
      .get();

    const count = countSnapshot.data().count || 0;

    return NextResponse.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error("Error getting notification count:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get notification count" },
      { status: 500 }
    );
  }
}
