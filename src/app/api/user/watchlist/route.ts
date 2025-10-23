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
    const offset = (page - 1) * limit;

    const userId = user.userId;

    // Mock watchlist items - replace with database query
    const watchlistItems = [
      {
        id: "watchlist_1",
        userId,
        auctionId: "auction_1",
        addedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        auction: {
          id: "auction_1",
          title: "Rare Vintage Beyblade Metal Series",
          image: "/images/auction-1.jpg",
          currentBid: 2500,
          startingBid: 1000,
          endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          status: "live",
          bidCount: 15,
          isWatched: true
        }
      },
      {
        id: "watchlist_2",
        userId,
        auctionId: "auction_4",
        addedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        auction: {
          id: "auction_4",
          title: "Classic Comic Book Collection",
          image: "/images/auction-4.jpg",
          currentBid: 1200,
          startingBid: 500,
          endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: "live",
          bidCount: 8,
          isWatched: true
        }
      },
      {
        id: "watchlist_3",
        userId,
        auctionId: "auction_5",
        addedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
        auction: {
          id: "auction_5",
          title: "Retro Gaming Console Bundle",
          image: "/images/auction-5.jpg",
          currentBid: 4500,
          startingBid: 2000,
          endTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
          status: "live",
          bidCount: 23,
          isWatched: true
        }
      }
    ];

    const paginatedItems = watchlistItems.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: {
        watchlist: paginatedItems,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(watchlistItems.length / limit),
          totalItems: watchlistItems.length,
          hasMore: offset + limit < watchlistItems.length
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
