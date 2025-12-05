/**
 * @fileoverview TypeScript Module
 * @module src/app/api/auctions/[id]/similar/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";

// GET /api/auctions/[id]/similar - similar by category, diverse shops
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

    const results: any[] = [];
    const seenShops = new Set<string>();

    const q1 = await Collections.auctions()
      .where("category_id", "==", auction.category_id)
      .limit(50)
      .get();
    for (const d of q1.docs) {
      const a = { id: d.id, ...d.data() } as any;
      if (a.id === id) continue;
      if (!seenShops.has(a.shop_id)) {
        seenShops.add(a.shop_id);
        results.push(a);
      }
      if (results.length >= 10) break;
    }

    return NextResponse.json({ success: true, data: results.slice(0, 10) });
  } catch (error) {
    console.error("Similar auctions error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load similar auctions" },
      { status: 500 },
    );
  }
}
