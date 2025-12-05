/**
 * @fileoverview TypeScript Module
 * @module src/app/api/header/stats/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

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

/**
 * HeaderStatsResponse interface
 * 
 * @interface
 * @description Defines the structure and contract for HeaderStatsResponse
 */
interface HeaderStatsResponse {
  /** Cart Count */
  cartCount: number;
  /** Notification Count */
  notificationCount: number;
  /** Messages Count */
  messagesCount: number;
  /** Favorites Count */
  favoritesCount: number;
  /** Rip Limit Balance */
  ripLimitBalance: number | null;
  /** Has Unpaid Auctions */
  hasUnpaidAuctions: boolean;
}

/**
 * GET /api/header/stats
 * Returns all header statistics in a single optimized call
 */
/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request);
 */

/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request);
 */

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);

    // For unauthenticated users, return defaults
    if (!auth.user) {
      return NextResponse.json({
        /** Success */
        success: true,
        /** Data */
        data: {
          /** Cart Count */
          cartCount: 0,
          /** Notification Count */
          notificationCount: 0,
          /** Messages Count */
          messagesCount: 0,
          /** Favorites Count */
          favoritesCount: 0,
          /** Rip Limit Balance */
          ripLimitBalance: null,
          /** Has Unpaid Auctions */
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
          0,
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
      /** Success */
      success: true,
      /** Data */
      data: response,
    });
  } catch (error) {
    console.error("Error fetching header stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch header stats" },
      { status: 500 },
    );
  }
}
