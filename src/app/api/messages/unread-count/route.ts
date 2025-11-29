/**
 * Messages Unread Count API
 * Epic: E033 - Live Header Data
 *
 * GET /api/messages/unread-count - Get unread message count
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/app/api/lib/auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

/**
 * GET /api/messages/unread-count
 * Returns the count of unread messages
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
      .collection(COLLECTIONS.MESSAGES)
      .where("recipient_id", "==", auth.user.uid)
      .where("read", "==", false)
      .count()
      .get();

    const count = countSnapshot.data().count || 0;

    return NextResponse.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error("Error getting message count:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get message count" },
      { status: 500 }
    );
  }
}
