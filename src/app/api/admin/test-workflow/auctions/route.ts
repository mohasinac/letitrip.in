import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/api/lib/session";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const user = await getCurrentUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { count = 3, userId, shopId } = body;

    if (!userId || !shopId) {
      return NextResponse.json(
        { success: false, error: "userId and shopId are required" },
        { status: 400 }
      );
    }

    if (count < 1 || count > 10) {
      return NextResponse.json(
        { success: false, error: "count must be between 1 and 10" },
        { status: 400 }
      );
    }

    // Get Firestore instance
    const db = getFirestoreAdmin();

    const auctionTitles = [
      "Premium Electronics Auction", "Luxury Watch Bidding", "Rare Collectible Sale",
      "Designer Fashion Auction", "Vintage Item Bidding", "Tech Gadget Auction"
    ];

    const createdIds: string[] = [];

    // Create auctions
    for (let i = 0; i < count; i++) {
      const auctionId = `TEST_AUCT_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`;
      const title = auctionTitles[Math.floor(Math.random() * auctionTitles.length)];

      const now = new Date();
      const startDate = new Date(now.getTime() + (1 + i) * 3600000); // Start in 1-N hours
      const endDate = new Date(startDate.getTime() + 48 * 3600000); // End 48 hours later

      const startingBid = Math.floor(Math.random() * 40000 + 10000) / 100; // $100-$500

      const auctionData = {
        id: auctionId,
        title: `TEST_AUCT_${title} #${i + 1}`,
        description: `Test auction for development. Auction ID: ${auctionId}`,
        startingBid,
        currentBid: startingBid,
        bidIncrement: Math.floor(startingBid / 10),
        buyoutPrice: startingBid * 3,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        shopId,
        userId,
        status: "upcoming",
        featured: Math.random() > 0.7,
        images: [],
        totalBids: 0,
        watchers: [],
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      await db.collection("auctions").doc(auctionId).set(auctionData);
      createdIds.push(auctionId);
    }

    return NextResponse.json({
      success: true,
      data: { ids: createdIds, count: createdIds.length },
      message: `${createdIds.length} test auctions created successfully`
    });
  } catch (error: any) {
    console.error("Error creating test auctions:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create test auctions" },
      { status: 500 }
    );
  }
}
