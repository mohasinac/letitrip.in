/**
 * @fileoverview TypeScript Module
 * @module src/app/api/header-stats/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

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

import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { logError } from "@/lib/error-logger";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Function: G E T
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
    const db = getFirestoreAdmin();
    const userId = request.headers.get("x-user-id");

    // If not authenticated, return zeros
    if (!userId) {
      return NextResponse.json({
        /** Success */
        success: true,
        /** Stats */
        stats: {
          /** Cart Count */
          cartCount: 0,
          /** Notification Count */
          notificationCount: 0,
          /** Message Count */
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
      /** Success */
      success: true,
      /** Stats */
      stats: {
        /** Cart Count */
        cartCount: cartSnapshot.data().count,
        /** Notification Count */
        notificationCount: notificationSnapshot.data().count,
        /** Message Count */
        messageCount: messageSnapshot.data().count,
      },
    });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "HeaderStatsAPI.GET",
    });

    return NextResponse.json(
      {
        /** Success */
        success: false,
        /** Error */
        error: "Failed to fetch header stats",
      },
      { status: 500 },
    );
  }
}
