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
    const { count, userId, shopId, auctions } = body;

    // Get Firestore instance
    const db = getFirestoreAdmin();
    const createdIds: string[] = [];
    const now = new Date();

    // If auctions array is provided, use it directly
    if (auctions && Array.isArray(auctions)) {
      for (let i = 0; i < auctions.length; i++) {
        const auction = auctions[i];
        const auctionId = `TEST_AUCT_${Date.now()}_${i}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        const auctionData = {
          id: auctionId,
          title: auction.name || auction.title,
          name: auction.name,
          slug: auction.slug,
          description: auction.description,
          startingBid: auction.startingBid,
          currentBid: auction.startingBid,
          reservePrice: auction.reservePrice,
          bidIncrement: auction.bidIncrement,
          buyoutPrice: auction.buyNowPrice || auction.buyoutPrice,
          buyNowPrice: auction.buyNowPrice,
          startDate: auction.startTime || auction.startDate,
          startTime: auction.startTime,
          endDate: auction.endTime || auction.endDate,
          endTime: auction.endTime,
          category: auction.categoryId || auction.category,
          categoryId: auction.categoryId,
          shopId: auction.shopId,
          userId: auction.sellerId || auction.userId,
          sellerId: auction.sellerId,
          status: auction.status || "upcoming",
          auctionType: auction.auctionType || "regular",
          isFeatured: auction.isFeatured || false,
          featured: auction.isFeatured || false,
          images: auction.images || [],
          totalBids: 0,
          watchers: [],
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        };

        await db.collection("auctions").doc(auctionId).set(auctionData);
        createdIds.push(auctionId);
      }
    } else {
      // Legacy mode: generate auctions from count, userId, shopId
      if (!userId || !shopId) {
        return NextResponse.json(
          {
            success: false,
            error:
              "userId and shopId are required when not providing auctions array",
          },
          { status: 400 }
        );
      }

      const auctionCount = count || 3;
      if (auctionCount < 1 || auctionCount > 10) {
        return NextResponse.json(
          { success: false, error: "count must be between 1 and 10" },
          { status: 400 }
        );
      }

      const auctionTitles = [
        "Premium Electronics Auction",
        "Luxury Watch Bidding",
        "Rare Collectible Sale",
        "Designer Fashion Auction",
        "Vintage Item Bidding",
        "Tech Gadget Auction",
      ];

      for (let i = 0; i < auctionCount; i++) {
        const auctionId = `TEST_AUCT_${Date.now()}_${i}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        const title =
          auctionTitles[Math.floor(Math.random() * auctionTitles.length)];

        const startDate = new Date(now.getTime() + (1 + i) * 3600000);
        const endDate = new Date(startDate.getTime() + 48 * 3600000);

        const startingBid = Math.floor(Math.random() * 40000 + 10000) / 100;

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
    }

    return NextResponse.json({
      success: true,
      data: { ids: createdIds, count: createdIds.length },
      message: `${createdIds.length} test auctions created successfully`,
    });
  } catch (error: any) {
    console.error("Error creating test auctions:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create test auctions",
      },
      { status: 500 }
    );
  }
}
