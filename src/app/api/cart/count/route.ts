/**
 * @fileoverview TypeScript Module
 * @module src/app/api/cart/count/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Cart Count API
 * Epic: E033 - Live Header Data
 *
 * GET /api/cart/count - Get cart item count
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthFromRequest } from "@/app/api/lib/auth";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

/**
 * GET /api/cart/count
 * Returns the total count of items in user's cart
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

    if (!auth.user) {
      return NextResponse.json({
        /** Success */
        success: true,
        /** Data */
        data: { count: 0 },
      });
    }

    const db = getFirestoreAdmin();
    const cartSnapshot = await db
      .collection(COLLECTIONS.CARTS)
      .where("user_id", "==", auth.user.uid)
      .where("status", "==", "active")
      .limit(1)
      .get();

    let count = 0;
    if (!cartSnapshot.empty) {
      const cartData = cartSnapshot.docs[0].data();
      if (cartData?.items && Array.isArray(cartData.items)) {
        count = cartData.items.reduce(
          (sum: number, item: { quantity?: number }) =>
            sum + (item.quantity || 1),
          0,
        );
      }
    }

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: { count },
    });
  } catch (error) {
    console.error("Error getting cart count:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get cart count" },
      { status: 500 },
    );
  }
}
