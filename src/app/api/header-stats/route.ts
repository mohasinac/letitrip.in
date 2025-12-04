/**
 * Header Stats API
 * Epic: Performance Optimization
 *
 * Single endpoint to fetch all header stats in one request:
 * - Cart item count
 * - Unread notifications count
 * - Unread messages count
 *
 * Reduces 3 separate requests to 1, improving performance
 */

import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/error-logger";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    const userId = request.headers.get("x-user-id");

    // If not authenticated, return zeros
    if (!userId) {
      return NextResponse.json({
        success: true,
        stats: {
          cartCount: 0,
          notificationCount: 0,
          messageCount: 0,
        },
      });
    }

    // Fetch all counts in parallel
    const [cartSnapshot, notificationSnapshot, messageSnapshot] =
      await Promise.all([
        // Cart items count
        db
          .collection(COLLECTIONS.CART_ITEMS)
          .where("userId", "==", userId)
          .count()
          .get(),

        // Unread notifications count
        db
          .collection(COLLECTIONS.NOTIFICATIONS)
          .where("userId", "==", userId)
          .where("read", "==", false)
          .count()
          .get(),

        // Unread messages count
        db
          .collection(COLLECTIONS.MESSAGES)
          .where("recipientId", "==", userId)
          .where("read", "==", false)
          .count()
          .get(),
      ]);

    return NextResponse.json({
      success: true,
      stats: {
        cartCount: cartSnapshot.data().count,
        notificationCount: notificationSnapshot.data().count,
        messageCount: messageSnapshot.data().count,
      },
    });
  } catch (error) {
    logError(error as Error, {
      component: "HeaderStatsAPI.GET",
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch header stats",
      },
      { status: 500 },
    );
  }
}
