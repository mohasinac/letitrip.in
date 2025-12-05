/**
 * @fileoverview TypeScript Module
 * @module src/app/api/admin/demo/progress/[sessionId]/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

/**
 * Function: G E T
 */
/**
 * Performs g e t operation
 *
 * @param {Request} _request - The _request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(_request, {});
 */

/**
 * Performs g e t operation
 *
 * @param {Request} _request - The _request
 * @param {{ params} { params } - The { params }
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(_request, {});
 */

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const db = getFirestoreAdmin();
    const { sessionId } = await params;

    // Count documents by demo session
    const [categories, users, shops, products, auctions, bids, orders] =
      await Promise.all([
        db
          .collection(COLLECTIONS.CATEGORIES)
          .where("demoSession", "==", sessionId)
          .count()
          .get(),
        db
          .collection(COLLECTIONS.USERS)
          .where("demoSession", "==", sessionId)
          .count()
          .get(),
        db
          .collection(COLLECTIONS.SHOPS)
          .where("demoSession", "==", sessionId)
          .count()
          .get(),
        db
          .collection(COLLECTIONS.PRODUCTS)
          .where("demoSession", "==", sessionId)
          .count()
          .get(),
        db
          .collection(COLLECTIONS.AUCTIONS)
          .where("demoSession", "==", sessionId)
          .count()
          .get(),
        db
          .collection(COLLECTIONS.BIDS)
          .where("demoSession", "==", sessionId)
          .count()
          .get(),
        db
          .collection(COLLECTIONS.ORDERS)
          .where("demoSession", "==", sessionId)
          .count()
          .get(),
      ]);

    const progress = {
      /** Categories */
      categories: categories.data().count,
      /** Users */
      users: users.data().count,
      /** Shops */
      shops: shops.data().count,
      /** Products */
      products: products.data().count,
      /** Auctions */
      auctions: auctions.data().count,
      /** Bids */
      bids: bids.data().count,
      /** Orders */
      orders: orders.data().count,
      total: 261, // Expected total
      /** Current */
      current:
        categories.data().count +
        users.data().count +
        shops.data().count +
        products.data().count +
        auctions.data().count +
        bids.data().count +
        orders.data().count,
      /** Percentage */
      percentage: 0,
      /** Status */
      status: "in_progress",
    };

    progress.percentage = Math.round((progress.current / progress.total) * 100);
    progress.status = progress.percentage >= 100 ? "completed" : "in_progress";

    return NextResponse.json(progress);
  } catch (error: any) {
    console.error("Progress fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
