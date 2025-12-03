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
 * Returns the total unread message count across all conversations
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
    const userId = auth.user.uid;

    // Get all conversations where user is a participant
    const conversationsSnapshot = await db
      .collection(COLLECTIONS.CONVERSATIONS)
      .where("participantIds", "array-contains", userId)
      .where("status", "==", "active")
      .get();

    // Sum up unread counts for this user across all conversations
    let totalUnread = 0;
    conversationsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      totalUnread += data.unreadCount?.[userId] || 0;
    });

    return NextResponse.json({
      success: true,
      data: { count: totalUnread },
    });
  } catch (error) {
    console.error("Error getting message count:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get message count" },
      { status: 500 },
    );
  }
}
