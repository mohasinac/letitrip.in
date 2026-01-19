/**
 * Bid History API Route
 *
 * Fetches the last 5 (or specified number) bids for an auction.
 * Returns bids in descending order by timestamp.
 *
 * @route GET /api/auctions/[slug]/bids
 *
 * @queryparam limit - Number of bids to return (default: 5, max: 50)
 *
 * @example
 * ```tsx
 * // Get last 5 bids
 * const response = await fetch('/api/auctions/vintage-watch-auction/bids');
 *
 * // Get last 10 bids
 * const response = await fetch('/api/auctions/vintage-watch-auction/bids?limit=10');
 * ```
 */

import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: {
    slug: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = params;
    const searchParams = request.nextUrl.searchParams;
    const limitParam = parseInt(searchParams.get("limit") || "5");

    // Validate and cap limit
    const bidLimit = Math.min(Math.max(limitParam, 1), 50);

    // Check if auction exists
    const auctionDoc = await getDoc(doc(db, "auctions", slug));
    if (!auctionDoc.exists()) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }

    // Query bids for this auction
    const bidsQuery = query(
      collection(db, "bids"),
      where("auctionSlug", "==", slug),
      orderBy("timestamp", "desc"),
      limit(bidLimit),
    );

    const querySnapshot = await getDocs(bidsQuery);

    // Process results
    const bids = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          auctionSlug: slug,
          bids,
          total: bids.length,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching bid history:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch bid history",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
