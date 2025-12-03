import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

const DEMO_PREFIX = "DEMO_";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { auctions, buyers, scale = 10 } = body;

    if (!auctions || !Array.isArray(auctions) || auctions.length === 0) {
      return NextResponse.json({ success: false, error: "Auctions data required" }, { status: 400 });
    }

    if (!buyers || !Array.isArray(buyers) || buyers.length === 0) {
      return NextResponse.json({ success: false, error: "Buyers data required" }, { status: 400 });
    }

    const db = getFirestoreAdmin();
    const timestamp = new Date();
    let totalBids = 0;

    for (const auctionId of auctions) {
      const auctionDoc = await db.collection(COLLECTIONS.AUCTIONS).doc(auctionId).get();
      if (!auctionDoc.exists) continue;
      
      const auctionData = auctionDoc.data();
      let currentBid = auctionData?.starting_bid || 5000;
      // Scale affects number of bidders: 1-3 bidders for scale 10, increases with scale
      const numBidders = Math.max(1, Math.min(Math.ceil(scale / 10 * (1 + Math.floor(Math.random() * 2))), buyers.length, 3));

      for (let b = 0; b < numBidders; b++) {
        const bidder = buyers[b % buyers.length];
        currentBid += (auctionData?.bid_increment || 500) + Math.floor(Math.random() * 500);

        const bidRef = db.collection(COLLECTIONS.BIDS).doc();
        await bidRef.set({
          auctionId,
          bidderId: bidder.id,
          bidderName: `${DEMO_PREFIX}${bidder.name}`,
          amount: currentBid,
          timestamp: new Date(timestamp.getTime() + totalBids * 60000),
          status: "active",
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
      success: true,
      step: "bids",
      data: {
        count: totalBids,
      },
    });
  } catch (error: unknown) {
    console.error("Demo bids error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate bids";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
