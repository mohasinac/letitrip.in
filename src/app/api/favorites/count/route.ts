/**
 * @fileoverview TypeScript Module
 * @module src/app/api/favorites/count/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

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
    const countSnapshot = await db
      .collection(COLLECTIONS.FAVORITES)
      .where("user_id", "==", auth.user.uid)
      .count()
      .get();

    const count = countSnapshot.data().count || 0;

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: { count },
    });
  } catch (error) {
    console.error("Error getting favorites count:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get favorites count" },
      { status: 500 },
    );
  }
}
