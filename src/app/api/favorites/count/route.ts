/**
 * Favorites Count API
 * Epic: E033 - Live Header Data
 *
 * GET /api/favorites/count - Get favorites count
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/app/api/lib/auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

/**
 * GET /api/favorites/count
 * Returns the count of user's favorites
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
      .collection(COLLECTIONS.FAVORITES)
      .where("user_id", "==", auth.user.uid)
      .count()
      .get();

    const count = countSnapshot.data().count || 0;

    return NextResponse.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error("Error getting favorites count:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get favorites count" },
      { status: 500 }
    );
  }
}
