/**
 * @fileoverview TypeScript Module
 * @module src/app/api/auctions/won/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "../../lib/session";

// GET /api/auctions/won - authenticated user's won auctions
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
    const user = await getCurrentUser(request);
    if (!user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
    // Assuming auctions store highest_bidder_id and status 'ended'
    const snap = await Collections.auctions()
      .where("status", "==", "ended")
      .where("highest_bidder_id", "==", user.id)
      .orderBy("updated_at", "desc")
      .limit(50)
      .get();
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Won auctions error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load won auctions" },
      { status: 500 },
    );
  }
}
