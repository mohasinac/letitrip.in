import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, ApiResponse } from "@/lib/auth/middleware";
import { getAdminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await authenticateUser(request);
    if (!user) {
      return ApiResponse.unauthorized("Authentication required");
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    const userId = user.userId;
    const db = getAdminDb();

    // Get watchlist items from Firebase
    const watchlistSnapshot = await db.collection('watchlist')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset(offset)
      .get();

    const watchlistItems = [];
    
    for (const doc of watchlistSnapshot.docs) {
      const watchlistData = doc.data();
      
      // Get auction details
      let auction = null;
      if (watchlistData.auctionId) {
        try {
          const auctionDoc = await db.collection('auctions').doc(watchlistData.auctionId).get();
          if (auctionDoc.exists) {
            const auctionData = auctionDoc.data();
            auction = {
              id: auctionDoc.id,
              title: auctionData?.title || 'Untitled Auction',
              image: auctionData?.images?.[0]?.url || '/images/placeholder-auction.jpg',
              currentBid: auctionData?.currentBid || auctionData?.startingPrice || 0,
              startingBid: auctionData?.startingPrice || 0,
              endTime: auctionData?.endTime?.toDate?.()?.toISOString() || new Date().toISOString(),
              status: auctionData?.status || 'upcoming',
              bidCount: auctionData?.bidCount || 0,
              isWatched: true
            };
          }
        } catch (error) {
          console.error('Error fetching auction:', error);
        }
      }

      if (auction) {
        watchlistItems.push({
          id: doc.id,
          userId,
          auctionId: watchlistData.auctionId,
          addedAt: watchlistData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          auction
        });
      }
    }

    // Get total count for pagination
    const totalSnapshot = await db.collection('watchlist')
      .where('userId', '==', userId)
      .get();
    const total = totalSnapshot.size;

    return NextResponse.json({
      success: true,
      data: {
        watchlist: watchlistItems,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          hasMore: offset + limit < total
        }
      }
    });

  } catch (error) {
    console.error("Get watchlist error:", error);
    return NextResponse.json(
      { error: "Failed to get watchlist" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const user = await authenticateUser(request);
    if (!user) {
      return ApiResponse.unauthorized("Authentication required");
    }

    const { auctionIds } = await request.json();
    const userId = user.userId;

    if (!auctionIds || !Array.isArray(auctionIds) || auctionIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid auction IDs" },
        { status: 400 }
      );
    }

    // Mock bulk removal - replace with database operations
    const removedCount = auctionIds.length;

    return NextResponse.json({
      success: true,
      message: `Removed ${removedCount} items from watchlist`,
      data: {
        removedCount,
        auctionIds
      }
    });

  } catch (error) {
    console.error("Bulk remove watchlist error:", error);
    return NextResponse.json(
      { error: "Failed to remove items from watchlist" },
      { status: 500 }
    );
  }
}
