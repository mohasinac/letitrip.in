import { NextRequest, NextResponse } from "next/server";
import { Collections } from "@/app/api/lib/firebase/collections";
import { getCurrentUser } from "../../lib/session";

// GET /api/auctions/watchlist - authenticated user's watched auctions
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
    
    // Get favorites of type auction_watch
    const favSnap = await Collections.favorites()
      .where("user_id", "==", user.id)
      .where("type", "==", "auction_watch")
      .orderBy("created_at", "desc")
      .limit(100)
      .get();
    
    if (favSnap.empty) {
      return NextResponse.json({ success: true, data: [] });
    }
    
    // Extract auction IDs from favorites
    const auctionIds = favSnap.docs
      .map((d) => d.data().item_id)
      .filter((id): id is string => !!id);
    
    if (auctionIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }
    
    // Fetch actual auction data (Firestore 'in' query supports max 30 items)
    const chunks: string[][] = [];
    for (let i = 0; i < auctionIds.length; i += 30) {
      chunks.push(auctionIds.slice(i, i + 30));
    }
    
    const auctions: any[] = [];
    for (const chunk of chunks) {
      const auctionSnap = await Collections.auctions()
        .where("__name__", "in", chunk)
        .get();
      auctionSnap.docs.forEach((d) => {
        auctions.push({ id: d.id, ...d.data() });
      });
    }
    
    // Sort by the original favorites order
    const orderMap = new Map(auctionIds.map((id, idx) => [id, idx]));
    auctions.sort((a, b) => (orderMap.get(a.id) ?? 999) - (orderMap.get(b.id) ?? 999));
    
    return NextResponse.json({ success: true, data: auctions });
  } catch (error) {
    console.error("Watchlist error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load watchlist" },
      { status: 500 },
    );
  }
}
