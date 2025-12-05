/**
 * @fileoverview TypeScript Module
 * @module src/app/api/admin/demo/summary/route
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
 * @returns {Promise<void>} Promise that resolves when operation completes
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * const result = GET();
 */
/**
 * Performs g e t operation
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET();
 */

/**
 * Performs g e t operation
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET();
 */

export async function GET() {
  try {
    const db = getFirestoreAdmin();

    // Get all unique demo sessions from categories
    const categoriesSnapshot = await db
      .collection(COLLECTIONS.CATEGORIES)
      .where("demoSession", "!=", null)
      .select("demoSession", "createdAt")
      .get();

    if (categoriesSnapshot.empty) {
      return NextResponse.json({
        /** Sessions */
        sessions: [],
        /** Total */
        total: 0,
      });
    }

    const sessionsMap = new Map<string, Date>();

    categoriesSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.demoSession && !sessionsMap.has(data.demoSession)) {
        sessionsMap.set(
          data.demoSession,
          data.createdAt?.toDate() || new Date(),
        );
      }
    });

    // Get summary for each session
    const summaries = await Promise.all(
      Array.from(sessionsMap.keys()).map(async (sessionId) => {
        const [
          categoriesCount,
          usersCount,
          shopsCount,
          productsCount,
          auctionsCount,
          bidsCount,
          ordersCount,
          paymentsCount,
          shipmentsCount,
        ] = await Promise.all([
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
          db
            .collection(COLLECTIONS.PAYMENTS)
            .where("demoSession", "==", sessionId)
            .count()
            .get(),
          db
            .collection(COLLECTIONS.SHIPMENTS)
            .where("demoSession", "==", sessionId)
            .count()
            .get(),
        ]);

        return {
          sessionId,
          /** Categories */
          categories: categoriesCount.data().count,
          /** Users */
          users: usersCount.data().count,
          /** Shops */
          shops: shopsCount.data().count,
          /** Products */
          products: productsCount.data().count,
          /** Auctions */
          auctions: auctionsCount.data().count,
          /** Bids */
          bids: bidsCount.data().count,
          /** Orders */
          orders: ordersCount.data().count,
          /** Order Items */
          orderItems: 0,
          /** Payments */
          payments: paymentsCount.data().count,
          /** Shipments */
          shipments: shipmentsCount.data().count,
          /** Reviews */
          reviews: 0,
          /** Created At */
          createdAt: sessionsMap.get(sessionId)!.toISOString(),
        };
      }),
    );

    // Sort by newest first
    summaries.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return NextResponse.json({
      /** Sessions */
      sessions: summaries,
      /** Total */
      total: summaries.length,
    });
  } catch (error: any) {
    console.error("Summary fetch error:", error);
    return NextResponse.json(
      {
        /** Sessions */
        sessions: [],
        /** Total */
        total: 0,
        /** Error */
        error: error.message,
      },
      { status: 200 },
    );
  }
}
