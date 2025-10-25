import { NextRequest, NextResponse } from "next/server";
import { createUserHandler } from "@/lib/auth/api-middleware";
import { authenticateUser, ApiResponse } from "@/lib/auth/middleware";
import { getAdminDb } from '@/lib/firebase/admin';

export const GET = createUserHandler(async (request: NextRequest, user) => {
  try {
    // Check authentication
    const user = await authenticateUser(request);
    if (!user) {
      return ApiResponse.unauthorized("Authentication required");
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "all"; // all, active, won, lost
    const offset = (page - 1) * limit;

    const userId = user.userId;
    const db = getAdminDb();

    // Get user bids from Firebase
    const bidsSnapshot = await db.collection('bids')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset(offset)
      .get();

    let userBids = [];
    
    for (const doc of bidsSnapshot.docs) {
      const bidData = doc.data();
      
      // Get auction details
      let auction = null;
      if (bidData.auctionId) {
        try {
          const auctionDoc = await db.collection('auctions').doc(bidData.auctionId).get();
          if (auctionDoc.exists) {
            const auctionData = auctionDoc.data();
            auction = {
              id: auctionDoc.id,
              title: auctionData?.title || 'Untitled Auction',
              image: auctionData?.images?.[0]?.url || '/images/placeholder-auction.jpg',
              currentBid: auctionData?.currentBid || 0,
              endTime: auctionData?.endTime?.toDate?.()?.toISOString() || new Date().toISOString(),
              status: auctionData?.status || 'upcoming'
            };
          }
        } catch (error) {
          console.error('Error fetching auction:', error);
        }
      }

      if (auction) {
        const isWinning = bidData.amount === auction.currentBid;
        userBids.push({
          id: doc.id,
          auctionId: bidData.auctionId,
          amount: bidData.amount,
          timestamp: bidData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          isWinning,
          auction
        });
      }
    }

    // Filter by status
    if (status !== "all") {
      switch (status) {
        case "active":
          userBids = userBids.filter(bid => bid.auction.status === "live");
          break;
        case "won":
          userBids = userBids.filter(bid => 
            bid.auction.status === "ended" && bid.isWinning
          );
          break;
        case "lost":
          userBids = userBids.filter(bid => 
            bid.auction.status === "ended" && !bid.isWinning
          );
          break;
      }
    }

    const paginatedBids = userBids.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: {
        bids: paginatedBids,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(userBids.length / limit),
          totalBids: userBids.length,
          hasMore: offset + limit < userBids.length
        },
        summary: {
          totalBids: userBids.length,
          activeBids: userBids.filter(bid => bid.auction.status === "live").length,
          wonAuctions: userBids.filter(bid => 
            bid.auction.status === "ended" && bid.isWinning
          ).length,
          lostAuctions: userBids.filter(bid => 
            bid.auction.status === "ended" && !bid.isWinning
          ).length
        }
      }
    });

  } catch (error) {
    console.error("Get user bids error:", error);
    return NextResponse.json(
      { error: "Failed to get user bids" },
      { status: 500 }
    );
  }
});
