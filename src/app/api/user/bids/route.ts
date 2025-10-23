import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, ApiResponse } from "@/lib/auth/middleware";

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
    const status = searchParams.get("status") || "all"; // all, active, won, lost
    const offset = (page - 1) * limit;

    const userId = user.userId;

    // Mock user bids - replace with database query
    let userBids = [
      {
        id: "bid_1",
        auctionId: "auction_1",
        amount: 2500,
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        isWinning: true,
        auction: {
          id: "auction_1",
          title: "Rare Vintage Beyblade Metal Series",
          image: "/images/auction-1.jpg",
          currentBid: 2500,
          endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          status: "live"
        }
      },
      {
        id: "bid_2",
        auctionId: "auction_2",
        amount: 1800,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isWinning: false,
        auction: {
          id: "auction_2",
          title: "Limited Edition Pokemon Card Set",
          image: "/images/auction-2.jpg",
          currentBid: 2100,
          endTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          status: "ended"
        }
      },
      {
        id: "bid_3",
        auctionId: "auction_3",
        amount: 3200,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        isWinning: true,
        auction: {
          id: "auction_3",
          title: "Vintage Action Figure Collection",
          image: "/images/auction-3.jpg",
          currentBid: 3200,
          endTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: "ended"
        }
      }
    ];

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
}
