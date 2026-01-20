/**
 * Auction Details API Route
 *
 * Fetches detailed information about a specific auction by slug.
 * Increments view count on each view.
 *
 * @route GET /api/auctions/[slug]
 *
 * @example
 * ```tsx
 * const response = await fetch('/api/auctions/vintage-watch-auction');
 * ```
 */

import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  increment,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;

    // Get auction document
    const auctionDoc = await getDoc(doc(db, "auctions", slug));

    if (!auctionDoc.exists()) {
      return NextResponse.json({ error: "Auction not found" }, { status: 404 });
    }

    const auctionData = auctionDoc.data();

    // Calculate auction status
    const now = Timestamp.now();
    const startTime = auctionData.startTime;
    const endTime = auctionData.endTime;

    let status: "upcoming" | "live" | "ended";
    if (startTime.toMillis() > now.toMillis()) {
      status = "upcoming";
    } else if (endTime.toMillis() > now.toMillis()) {
      status = "live";
    } else {
      status = "ended";
    }

    // Increment view count asynchronously
    updateDoc(doc(db, "auctions", slug), {
      viewCount: increment(1),
    }).catch((error) =>
      console.error("Failed to increment view count:", error),
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          slug,
          ...auctionData,
          status,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching auction:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch auction",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
