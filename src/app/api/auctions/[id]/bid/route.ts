/**
 * @fileoverview TypeScript Module
 * @module src/app/api/auctions/[id]/bid/route
 * @description This file contains functionality related to route
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { Collections } from "@/app/api/lib/firebase/collections";
import { placeBid } from "@/app/api/lib/firebase/transactions";
import { withIPTracking } from "@/app/api/middleware/ip-tracker";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../lib/session";

// GET bids list
/**
 * Function: G E T
 */
/**
 * Performs g e t operation
 *
 * @param {NextRequest} request - The request
 * @param {{ params} context - The context
 *
 * @returns {Promise<any>} Promise resolving to get result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * GET(request, {});
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

export async function GET(
  /** Request */
  request: NextRequest,
  /** Context */
  context: { params: Promise<{ id: string }> }
) {
  const { params } = context;
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const startAfter = searchParams.get("startAfter");
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    /**
     * Sorts order
     *
     * @returns {any} The sortorder result
     */

    /**
     * Sorts order
     *
     * @returns {any} The sortorder result
     */

    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";

    let query = Collections.bids()
      .where("auction_id", "==", id)
      .orderBy("created_at", sortOrder);

    // Apply cursor pagination
    if (startAfter) {
      const startDoc = await Collections.bids().doc(startAfter).get();
      if (startDoc.exists) {
        query = query.startAfter(startDoc);
      }
    }

    // Fetch limit + 1 to check if there's a next page
    query = query.limit(limit + 1);
    const snap = await query.get();
    const docs = snap.docs;

    // Check if there's a next page
    const hasNextPage = docs.length > limit;
    const resultDocs = hasNextPage ? docs.slice(0, limit) : docs;

    /**
 * Performs data operation
 *
 * @param {any} (d - The (d
 *
 * @returns {any} The data result
 *
 */
const data = resultDocs.map((d) => ({ id: d.id, ...d.data() }));
    const nextCursor =
      hasNextPage && resultDocs.length > 0
        ? resultDocs[resultDocs.length - 1].id
        : null;

    return NextResponse.json({
      /** Success */
      success: true,
      data,
      /** Count */
      count: data.length,
      /** Pagination */
      pagination: {
        limit,
        hasNextPage,
        nextCursor,
      },
    });
  } catch (error) {
    console.error("List bids error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to list bids" },
      { status: 500 }
    );
  }
}

/**
 * Function: Place Bid Handler
 */
/**
 * Performs place bid handler operation
 *
 * @param {Request} request - The request
 * @param {{ params} [context] - The context
 *
 * @returns {Promise<any>} Promise resolving to placebidhandler result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

/**
 * Performs place bid handler operation
 *
 * @returns {Promise<any>} Promise resolving to placebidhandler result
 *
 * @throws {Error} When operation fails or validation errors occur
 */

async function placeBidHandler(
  /** Request */
  request: Request,
  /** Context */
  context?: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request as NextRequest);
    if (!user?.id)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    if (!context?.params) {
      return NextResponse.json(
        { success: false, error: "Invalid request" },
        { status: 400 }
      );
    }
    const { id } = await context.params;
    const body = await request.json();
    // Accept both 'amount' (from service) and 'bidAmount' (legacy) for backwards compatibility
    const bidAmount = Number(body.amount ?? body.bidAmount);
    if (!Number.isFinite(bidAmount) || bidAmount <= 0)
      return NextResponse.json(
        { success: false, error: "Invalid bid amount" },
        { status: 400 }
      );

    const bidId = await placeBid(id, user.id, bidAmount);
    const bidDoc = await Collections.bids().doc(bidId).get();

    return NextResponse.json({
      /** Success */
      success: true,
      /** Data */
      data: { id: bidDoc.id, ...bidDoc.data() },
    });
  } catch (error) {
    console.error("Place bid error:", error);
    return NextResponse.json(
      {
        /** Success */
        success: false,
        /** Error */
        error: (error as Error).message || "Failed to place bid",
      },
      { status: 400 }
    );
  }
}

// Export with IP tracking and rate limiting (max 20 bids per 15 minutes)
/**
 * Post
 * @constant
 */
export const POST = withIPTracking(placeBidHandler, {
  /** Action */
  action: "bid_placed",
  /** Check Rate Limit */
  checkRateLimit: true,
  /** Max Attempts */
  maxAttempts: 20,
  /** Window Minutes */
  windowMinutes: 15,
});
