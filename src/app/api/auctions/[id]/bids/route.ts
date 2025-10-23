import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, ApiResponse } from "@/lib/auth/middleware";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const user = await authenticateUser(request);
    if (!user) {
      return ApiResponse.unauthorized("Authentication required");
    }

    const auctionId = params.id;
    const { amount } = await request.json();

    // Validate bid amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid bid amount" },
        { status: 400 }
      );
    }

    const userId = user.userId;

    // Mock auction validation - replace with database query
    const auction = {
      id: auctionId,
      currentBid: 2500,
      minimumBid: 2600,
      status: "live",
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      sellerId: "seller_1"
    };

    // Check if auction exists and is active
    if (auction.status !== "live") {
      return NextResponse.json(
        { error: "Auction is not active" },
        { status: 400 }
      );
    }

    // Check if auction has ended
    if (new Date(auction.endTime) < new Date()) {
      return NextResponse.json(
        { error: "Auction has ended" },
        { status: 400 }
      );
    }

    // Check if user is not the seller
    if (auction.sellerId === userId) {
      return NextResponse.json(
        { error: "Cannot bid on your own auction" },
        { status: 400 }
      );
    }

    // Check if bid meets minimum requirement
    if (amount < auction.minimumBid) {
      return NextResponse.json(
        { error: `Bid must be at least ₹${auction.minimumBid}` },
        { status: 400 }
      );
    }

    // Create new bid - replace with database insert
    const newBid = {
      id: `bid_${Date.now()}`,
      auctionId,
      userId,
      amount,
      timestamp: new Date().toISOString(),
      isWinning: true
    };

    // Update auction current bid - replace with database update
    auction.currentBid = amount;

    // Mock notification to previous high bidder
    // In real implementation, send notification/email

    return NextResponse.json({
      success: true,
      message: "Bid placed successfully",
      data: {
        bid: newBid,
        currentBid: amount,
        minimumBid: amount + 100
      }
    });

  } catch (error) {
    console.error("Place bid error:", error);
    return NextResponse.json(
      { error: "Failed to place bid" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auctionId = params.id;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Mock bid history - replace with database query
    const bids = [
      {
        id: "bid_1",
        userId: "user_1",
        userName: "BeybladeExpert",
        amount: 2500,
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        isWinning: true
      },
      {
        id: "bid_2",
        userId: "user_2",
        userName: "MetalFusionFan",
        amount: 2400,
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        isWinning: false
      },
      {
        id: "bid_3",
        userId: "user_3",
        userName: "CollectorKing",
        amount: 2300,
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        isWinning: false
      },
      {
        id: "bid_4",
        userId: "user_4",
        userName: "ToyCollector",
        amount: 2200,
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        isWinning: false
      },
      {
        id: "bid_5",
        userId: "user_5",
        userName: "VintageHunter",
        amount: 2100,
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        isWinning: false
      }
    ];

    const paginatedBids = bids.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: {
        bids: paginatedBids,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(bids.length / limit),
          totalBids: bids.length,
          hasMore: offset + limit < bids.length
        }
      }
    });

  } catch (error) {
    console.error("Get bid history error:", error);
    return NextResponse.json(
      { error: "Failed to get bid history" },
      { status: 500 }
    );
  }
}
