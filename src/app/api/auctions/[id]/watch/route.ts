/**
 * @fileoverview TypeScript Module
 * @module src/app/api/auctions/[id]/watch/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "../../../lib/session";

// POST /api/auctions/[id]/watch - toggle watch
/**
 * Function: P O S T
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request, {});
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} /** Request */
  request - The /**  request */
  request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(/** Request */
  request, {});
 */

export async function POST(
  /** Request */
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser(request);
    if (!user?.id)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    const { id } = await params;

    const key = `${user.id}_${id}`;
    const doc = await Collections.favorites().doc(key).get();
    if (doc.exists) {
      await Collections.favorites().doc(key).delete();
      return NextResponse.json({ success: true, watching: false });
    } else {
      await Collections.favorites().doc(key).set({
        user_id: user.id,
        auction_id: id,
        created_at: new Date().toISOString(),
        /** Type */
        type: "auction_watch",
      });
      return NextResponse.json({ success: true, watching: true });
    }
  } catch (error) {
    console.error("Toggle watch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle watch" },
      { status: 500 },
    );
  }
}
