import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auctionId = params.id;

    // Mock auction data - replace with database query
    const auction = {
      id: auctionId,
      title: "Rare Vintage Beyblade Metal Series",
      description: `This is an extremely rare vintage Beyblade from the Metal Fusion series, manufactured in 2010. 
      
Features:
• Authentic Takara Tomy product
• Metal Fusion technology
• Complete with ripcord launcher
• Original packaging included
• Certificate of authenticity

Condition: Mint condition, barely used. No scratches or damage.

This is a collector's dream item and perfect for serious Beyblade enthusiasts. The metal series is known for its superior performance and durability.`,
      images: [
        "/images/auction-1.jpg",
        "/images/auction-2.jpg",
        "/images/auction-3.jpg",
      ],
      currentBid: 2500,
      startingBid: 1000,
      minimumBid: 2600,
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      status: "live",
      bidCount: 15,
      category: "Beyblades",
      condition: "Mint",
      isAuthentic: true,
      seller: {
        id: "seller_1",
        name: "CollectorPro",
        rating: 4.9,
        totalSales: 156,
        memberSince: "2020-01-15",
        verified: true
      },
      bids: [
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
        }
      ],
      watchlist: ["user_4", "user_5", "user_6"],
      shippingInfo: {
        domestic: {
          cost: 99,
          time: "3-5 business days"
        },
        international: {
          available: false
        }
      },
      returnPolicy: "No returns on auction items unless item is not as described",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: auction
    });

  } catch (error) {
    console.error("Get auction error:", error);
    return NextResponse.json(
      { error: "Failed to get auction" },
      { status: 500 }
    );
  }
}
