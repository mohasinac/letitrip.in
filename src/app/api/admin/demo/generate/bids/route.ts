/**
 * @fileoverview TypeScript Module
 * @module src/app/api/admin/demo/generate/bids/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

/**
 * DEMO_PREFIX constant
 * 
 * @constant
 * @type {any}
 * @description Configuration constant for demo prefix
 */
const DEMO_PREFIX = "DEMO_";

/**
 * Function: P O S T
 */
/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

/**
 * Performs p o s t operation
 *
 * @param {NextRequest} request - The request
 *
 * @returns {Promise<any>} Promise resolving to post result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * POST(request);
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { auctions, buyers, scale = 10 } = body;

    if (!auctions || !Array.isArray(auctions) || auctions.length === 0) {
      return NextResponse.json(
        { success: false, error: "Auctions data required" },
        { status: 400 },
      );
    }

    if (!buyers || !Array.isArray(buyers) || buyers.length === 0) {
      return NextResponse.json(
        { success: false, error: "Buyers data required" },
        { status: 400 },
      );
    }

    const db = getFirestoreAdmin();
    const timestamp = new Date();
    let totalBids = 0;

    for (const auctionId of auctions) {
      const auctionDoc = await db
        .collection(COLLECTIONS.AUCTIONS)
        .doc(auctionId)
        .get();
      if (!auctionDoc.exists) continue;

      const auctionData = auctionDoc.data();
      let currentBid = auctionData?.starting_bid || 5000;
      // Scale affects number of bidders: 1-3 bidders for scale 10, increases with scale
      const numBidders = Math.max(
        1,
        Math.min(
          Math.ceil((scale / 10) * (1 + Math.floor(Math.random() * 2))),
          buyers.length,
          3,
        ),
      );

      for (let b = 0; b < numBidders; b++) {
        const bidder = buyers[b % buyers.length];
        currentBid +=
          (auctionData?.bid_increment || 500) + Math.floor(Math.random() * 500);

        const bidRef = db.collection(COLLECTIONS.BIDS).doc();
        await bidRef.set({
          auctionId,
          /** Bidder Id */
          bidderId: bidder.id,
          /** Bidder Name */
          bidderName: `${DEMO_PREFIX}${bidder.name}`,
          /** Amount */
          amount: currentBid,
          /** Timestamp */
          timestamp: new Date(timestamp.getTime() + totalBids * 60000),
          /** Status */
          status: "active",
          /** Created At */
          createdAt: timestamp,
        });
        totalBids++;
      }

      await db.collection(COLLECTIONS.AUCTIONS).doc(auctionId).update({
        current_bid: currentBid,
        total_bids: numBidders,
        unique_bidders: numBidders,
      });
    }

    return NextResponse.json({
      /** Success */
      success: true,
      /** Step */
      step: "bids",
      /** Data */
      data: {
        /** Count */
        count: totalBids,
      },
    });
  } catch (error: unknown) {
    console.error("Demo bids error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate bids";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
