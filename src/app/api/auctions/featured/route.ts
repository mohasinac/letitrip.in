import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const showLive = searchParams.get("live") !== "false";
    const showClosed = searchParams.get("closed") !== "false";
    const limit = parseInt(searchParams.get("limit") || "6");

    // Mock auction data
    const mockAuctions = [
      {
        id: "1",
        title: "Rare Limited Edition Beyblade - Gold Dragon",
        description: "Ultra-rare collector's edition with special gold finish",
        currentBid: 1250,
        startingBid: 500,
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        image: "/images/auction-1.jpg",
        isLive: true,
        totalBids: 24,
        totalViews: 456,
        watchers: 89,
        seller: {
          id: "seller-1",
          name: "Premium Collectibles",
          rating: 4.9,
        }
      },
      {
        id: "2",
        title: "Vintage Beyblade Stadium Collection Set",
        description: "Complete set of vintage stadiums from original series",
        currentBid: 890,
        startingBid: 300,
        endTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
        image: "/images/auction-2.jpg",
        isLive: true,
        totalBids: 18,
        totalViews: 234,
        watchers: 67,
        seller: {
          id: "seller-2",
          name: "Retro Toys Hub",
          rating: 4.7,
        }
      },
      {
        id: "3",
        title: "Championship Tournament Beyblade Set",
        description: "Official tournament-grade Beyblades used in competitions",
        currentBid: 750,
        startingBid: 400,
        endTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        image: "/images/auction-3.jpg",
        isLive: true,
        totalBids: 32,
        totalViews: 678,
        watchers: 125,
        seller: {
          id: "seller-3",
          name: "Tournament Pro",
          rating: 4.8,
        }
      },
      {
        id: "4",
        title: "Metal Fight Beyblade Complete Collection",
        description: "All 48 Beyblades from Metal Fight series in mint condition",
        currentBid: 2150,
        startingBid: 1000,
        endTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        image: "/images/auction-4.jpg",
        isLive: false,
        totalBids: 67,
        totalViews: 892,
        watchers: 203,
        seller: {
          id: "seller-4",
          name: "Complete Collections",
          rating: 4.9,
        }
      },
      {
        id: "5",
        title: "Prototype Lightning L-Drago",
        description: "Rare prototype version never released to public",
        currentBid: 1850,
        startingBid: 800,
        endTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        image: "/images/auction-5.jpg",
        isLive: false,
        totalBids: 45,
        totalViews: 567,
        watchers: 134,
        seller: {
          id: "seller-5",
          name: "Prototype Vault",
          rating: 4.6,
        }
      },
      {
        id: "6",
        title: "Signed Beyblade by Ginga Hagane Voice Actor",
        description: "Official Beyblade signed by the Japanese voice actor",
        currentBid: 980,
        startingBid: 200,
        endTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        image: "/images/auction-6.jpg",
        isLive: false,
        totalBids: 28,
        totalViews: 345,
        watchers: 76,
        seller: {
          id: "seller-6",
          name: "Anime Memorabilia",
          rating: 4.5,
        }
      }
    ];

    // Filter by live/closed status
    let auctions = mockAuctions;
    if (showLive && !showClosed) {
      auctions = mockAuctions.filter(auction => auction.isLive);
    } else if (!showLive && showClosed) {
      auctions = mockAuctions.filter(auction => !auction.isLive);
    }

    // Sort by hotness (combination of views, bids, and watchers)
    auctions = auctions.sort((a, b) => {
      const aHotness = a.totalViews + (a.totalBids * 3) + (a.watchers * 2);
      const bHotness = b.totalViews + (b.totalBids * 3) + (b.watchers * 2);
      return bHotness - aHotness;
    });

    // If we want to mix live and closed, ensure we have a good balance
    if (showLive && showClosed && limit >= 3) {
      const liveAuctions = auctions.filter(a => a.isLive);
      const closedAuctions = auctions.filter(a => !a.isLive);
      
      // Take at least 1 live and 1 closed if available
      const minLive = Math.min(liveAuctions.length, Math.ceil(limit * 0.6));
      const minClosed = Math.min(closedAuctions.length, limit - minLive);
      
      auctions = [
        ...liveAuctions.slice(0, minLive),
        ...closedAuctions.slice(0, minClosed)
      ].sort((a, b) => {
        const aHotness = a.totalViews + (a.totalBids * 3) + (a.watchers * 2);
        const bHotness = b.totalViews + (b.totalBids * 3) + (b.watchers * 2);
        return bHotness - aHotness;
      });
    }

    // Limit results
    auctions = auctions.slice(0, limit);

    return NextResponse.json({
      auctions,
      total: auctions.length,
      filters: {
        showLive,
        showClosed,
        limit
      }
    });
  } catch (error) {
    console.error("Error fetching auctions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
