import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const db = getAdminDb();
    
    let auctionsQuery: any = db.collection('auctions');

    // Filter by status if specified
    if (status !== 'all') {
      auctionsQuery = auctionsQuery.where('status', '==', status);
    }

    // Order by creation date
    auctionsQuery = auctionsQuery.orderBy('createdAt', 'desc');

    const auctionsSnapshot = await auctionsQuery.get();
    
    let allAuctions = auctionsSnapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        images: data.images || [data.image] || ['/images/auctions/default.jpg'],
        currentBid: data.currentBid || data.startingBid || 0,
        startingBid: data.startingBid || 0,
        minimumBid: data.minimumBid || 0,
        endTime: data.endTime?.toDate?.()?.toISOString() || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: data.status || 'upcoming',
        bidCount: data.bidCount || 0,
        category: data.category || 'Beyblades',
        condition: data.condition || 'New',
        isAuthentic: data.isAuthentic !== false,
        seller: data.seller || {
          id: 'default',
          name: 'Verified Seller',
          rating: 4.8,
          totalSales: 50
        },
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        winner: data.winner || null
      };
    });

    // Filter by status after loading
    let filteredAuctions = allAuctions;
    if (status !== 'all') {
      filteredAuctions = allAuctions.filter((auction: any) => auction.status === status);
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
          live: allAuctions.filter((a: any) => a.status === 'live').length,
          upcoming: allAuctions.filter((a: any) => a.status === 'upcoming').length,
          ended: allAuctions.filter((a: any) => a.status === 'ended').length
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
