import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    // Mock auction data - replace with database query
    const allAuctions = [
      {
        id: "auction_1",
        title: "Rare Vintage Beyblade Metal Series",
        description: "Limited edition metal fusion beyblade from 2010 series",
        images: ["/images/auction-1.jpg", "/images/auction-2.jpg"],
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
          totalSales: 156
        },
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "auction_2",
        title: "Professional Tournament Stadium",
        description: "Official tournament grade stadium with battle accessories",
        images: ["/images/auction-2.jpg"],
        currentBid: 0,
        startingBid: 3000,
        minimumBid: 3000,
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: "upcoming",
        bidCount: 0,
        category: "Stadiums",
        condition: "New",
        isAuthentic: true,
        seller: {
          id: "seller_2",
          name: "TournamentGear",
          rating: 4.8,
          totalSales: 89
        },
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "auction_3",
        title: "Complete Launcher Collection Set",
        description: "Set of 5 different launcher types with grips",
        images: ["/images/auction-3.jpg"],
        currentBid: 1800,
        startingBid: 800,
        minimumBid: 0,
        endTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        status: "ended",
        bidCount: 23,
        category: "Launchers",
        condition: "Used",
        isAuthentic: true,
        seller: {
          id: "seller_3",
          name: "LauncherMaster",
          rating: 4.7,
          totalSales: 234
        },
        createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
        winner: {
          userId: "user_1",
          userName: "BeybladeExpert"
        }
      }
    ];

    // Filter by status
    let filteredAuctions = allAuctions;
    if (status !== 'all') {
      filteredAuctions = allAuctions.filter(auction => auction.status === status);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedAuctions = filteredAuctions.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: {
        auctions: paginatedAuctions,
        pagination: {
          page,
          limit,
          total: filteredAuctions.length,
          totalPages: Math.ceil(filteredAuctions.length / limit),
          hasNext: endIndex < filteredAuctions.length,
          hasPrev: page > 1
        },
        stats: {
          total: allAuctions.length,
          live: allAuctions.filter(a => a.status === 'live').length,
          upcoming: allAuctions.filter(a => a.status === 'upcoming').length,
          ended: allAuctions.filter(a => a.status === 'ended').length
        }
      }
    });

  } catch (error) {
    console.error("Get auctions error:", error);
    return NextResponse.json(
      { error: "Failed to get auctions" },
      { status: 500 }
    );
  }
}
