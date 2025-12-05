/**
 * @fileoverview TypeScript Module
 * @module src/app/api/auctions/my-bids/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { Collections } from "@/app/api/lib/firebase/collections";
import { logError } from "@/lib/firebase-error-logger";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../lib/session";

// GET /api/auctions/my-bids - authenticated user's bids
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
  let userId: string | undefined;
  try {
    const user = await getCurrentUser(request);
    userId = user?.id;
    if (!user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
    const snap = await Collections.bids()
      .where("user_id", "==", user.id)
      .orderBy("created_at", "desc")
      .limit(50)
      .get();
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ success: true, data });
  } catch (error) {
    logError(error as Error, {
      /** Component */
      component: "API.auctions.my-bids",
      userId,
    });
    return NextResponse.json(
      { success: false, error: "Failed to load my bids" },
      { status: 500 },
    );
  }
}
