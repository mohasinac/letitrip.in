/**
 * @fileoverview TypeScript Module
 * @module src/app/api/auctions/[id]/seller-items/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";

// GET /api/auctions/[id]/seller-items - other auctions from same shop
/**
 * Function: G E T
 */
/**
 * Performs g e t operation
 *
 * @param {Request} _ - The _
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(_, {});
 */

/**
 * Performs g e t operation
 *
 * @param {Request} _ - The _
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(_, {});
 */

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const doc = await Collections.auctions().doc(id).get();
    if (!doc.exists)
      return NextResponse.json(
        { success: false, error: "Auction not found" },
        { status: 404 },
      );
    const auction: any = { id: doc.id, ...doc.data() };

    const snap = await Collections.auctions()
      .where("shop_id", "==", auction.shop_id)
      .limit(11)
      .get();
    const data = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }) as any)
      .filter((a) => a.id !== id)
      .slice(0, 10);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Seller auctions error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load seller auctions" },
      { status: 500 },
    );
  }
}
