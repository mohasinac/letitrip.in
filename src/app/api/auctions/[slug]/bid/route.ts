/**
 * Place Bid API Route
 *
 * Places a bid on a live auction.
 * Validates bid amount, auction status, and updates highest bid.
 *
 * @route POST /api/auctions/[slug]/bid
 *
 * @example
 * ```tsx
 * const response = await fetch('/api/auctions/vintage-watch-auction/bid', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     bidAmount: 1500,
 *     userId: 'user-id',
 *     userName: 'John Doe'
 *   })
 * });
 * ```
 */

import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: {
    slug: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = params;
    const body = await request.json();
    const { bidAmount, userId, userName } = body;

    // Validate required fields
    if (!bidAmount || !userId || !userName) {
      return NextResponse.json(
        { error: "Bid amount, user ID, and user name are required" },
        { status: 400 },
      );
    }

    // Get auction document
    const auctionRef = doc(db, "auctions", slug);
    const auctionDoc = await getDoc(auctionRef);

    if (!auctionDoc.exists()) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }

    const auctionData = auctionDoc.data();
    const now = Timestamp.now();

    // Check if auction is live
    if (auctionData.startTime.toMillis() > now.toMillis()) {
      return NextResponse.json(
        { error: "Auction has not started yet" },
        { status: 400 },
      );
    }

    if (auctionData.endTime.toMillis() <= now.toMillis()) {
      return NextResponse.json({ error: "Auction has ended" }, { status: 400 });
    }

    // Validate bid amount
    const currentBid = auctionData.currentBid || auctionData.startingBid || 0;
    const minIncrement = auctionData.minBidIncrement || 10;
    const minValidBid = currentBid + minIncrement;

    if (bidAmount < minValidBid) {
      return NextResponse.json(
        {
          error: `Bid must be at least ${minValidBid}`,
          minBid: minValidBid,
        },
        { status: 400 },
      );
    }

    // Prevent users from bidding on their own auction
    if (userId === auctionData.sellerId) {
      return NextResponse.json(
        { error: "Cannot bid on your own auction" },
        { status: 403 },
      );
    }

    // Create bid document
    const bidData = {
      auctionSlug: slug,
      userId,
      userName,
      bidAmount,
      timestamp: serverTimestamp(),
      isWinning: true, // This bid becomes the winning bid
    };

    const bidRef = await addDoc(collection(db, "bids"), bidData);

    // Update auction with new highest bid
    await updateDoc(auctionRef, {
      currentBid: bidAmount,
      highestBidderId: userId,
      highestBidderName: userName,
      totalBids: increment(1),
      lastBidTime: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Bid placed successfully",
        data: {
          bidId: bidRef.id,
          bidAmount,
          currentBid: bidAmount,
          totalBids: (auctionData.totalBids || 0) + 1,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error placing bid:", error);

    return NextResponse.json(
      {
        error: "Failed to place bid",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
