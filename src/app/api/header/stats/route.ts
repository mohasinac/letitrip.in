/**
 * Header Stats API
 * Epic: E033 - Live Header Data
 *
 * GET /api/header/stats - Get all header statistics in one call
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/app/api/lib/auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

interface HeaderStatsResponse {
  cartCount: number;
  notificationCount: number;
  messagesCount: number;
  favoritesCount: number;
  ripLimitBalance: number | null;
  hasUnpaidAuctions: boolean;
}

/**
 * GET /api/header/stats
 * Returns all header statistics in a single optimized call
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);

    // For unauthenticated users, return defaults
    if (!auth.user) {
      return NextResponse.json({
        success: true,
        data: {
          cartCount: 0,
          notificationCount: 0,
          messagesCount: 0,
          favoritesCount: 0,
          ripLimitBalance: null,
          hasUnpaidAuctions: false,
        } as HeaderStatsResponse,
      });
    }

    const userId = auth.user.uid;
    const db = getFirestoreAdmin();

    // Fetch all stats in parallel for optimal performance
    const [
      cartSnapshot,
      notificationSnapshot,
      messagesSnapshot,
      favoritesSnapshot,
      ripLimitDoc,
    ] = await Promise.all([
      // Cart count - items in user's active cart
      db
        .collection(COLLECTIONS.CARTS)
        .where("user_id", "==", userId)
        .where("status", "==", "active")
        .limit(1)
        .get(),

      // Unread notifications count
      db
        .collection(COLLECTIONS.NOTIFICATIONS)
        .where("user_id", "==", userId)
        .where("read", "==", false)
        .count()
        .get(),

      // Unread messages count (for sellers/users with conversations)
      db
        .collection(COLLECTIONS.MESSAGES)
        .where("recipient_id", "==", userId)
        .where("read", "==", false)
        .count()
        .get(),

      // Favorites count
      db
        .collection(COLLECTIONS.FAVORITES)
        .where("user_id", "==", userId)
        .count()
        .get(),

      // RipLimit account
      db.collection(COLLECTIONS.RIPLIMIT_ACCOUNTS).doc(userId).get(),
    ]);

    // Calculate cart count from cart items
    let cartCount = 0;
    if (!cartSnapshot.empty) {
      const cartDoc = cartSnapshot.docs[0];
      const cartData = cartDoc.data();
      if (cartData?.items && Array.isArray(cartData.items)) {
        cartCount = cartData.items.reduce(
          (sum: number, item: { quantity?: number }) =>
            sum + (item.quantity || 1),
          0
        );
      }
    }

    // Get notification count
    const notificationCount = notificationSnapshot.data().count || 0;

    // Get messages count
    const messagesCount = messagesSnapshot.data().count || 0;

    // Get favorites count
    const favoritesCount = favoritesSnapshot.data().count || 0;

    // Get RipLimit balance and unpaid auction status
    let ripLimitBalance: number | null = null;
    let hasUnpaidAuctions = false;

    if (ripLimitDoc.exists) {
      const ripLimitData = ripLimitDoc.data();
      if (ripLimitData) {
        // Available balance (total - blocked)
        ripLimitBalance =
          (ripLimitData.balance || 0) - (ripLimitData.blocked_balance || 0);
        hasUnpaidAuctions = ripLimitData.has_unpaid_auction === true;
      }
    }

    const response: HeaderStatsResponse = {
      cartCount,
      notificationCount,
      messagesCount,
      favoritesCount,
      ripLimitBalance,
      hasUnpaidAuctions,
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error fetching header stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch header stats" },
      { status: 500 }
    );
  }
}
