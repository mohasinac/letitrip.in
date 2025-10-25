import { NextRequest, NextResponse } from "next/server";
import { createUserHandler } from "@/lib/auth/api-middleware";
import { getAdminDb } from '@/lib/database/admin';

export const GET = createUserHandler(async (request: NextRequest, user) => {
  try {
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
});

export const DELETE = createUserHandler(async (request: NextRequest, user) => {
  try {
    const { auctionIds } = await request.json();
    const userId = user.userId;

    if (!auctionIds || !Array.isArray(auctionIds) || auctionIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid auction IDs" },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const batch = db.batch();
    let removedCount = 0;

    // Find and delete watchlist items for this user and auction IDs
    for (const auctionId of auctionIds) {
      const watchlistQuery = await db.collection('watchlist')
        .where('userId', '==', userId)
        .where('auctionId', '==', auctionId)
        .get();

      watchlistQuery.forEach(doc => {
        batch.delete(doc.ref);
        removedCount++;
      });
    }

    // Commit the batch delete
    await batch.commit();

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
});
