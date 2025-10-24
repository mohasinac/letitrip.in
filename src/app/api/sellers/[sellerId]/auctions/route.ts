import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

const db = getAdminDb();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sellerId: string }> }
) {
  try {
    const { sellerId } = await params;
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const sort = searchParams.get('sort') || 'ending_soon';

    // Verify seller exists
    const sellerDoc = await db.collection('users').doc(sellerId).get();
    if (!sellerDoc.exists) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }

    // Build query
    let query = db
      .collection('auctions')
      .where('sellerId', '==', sellerId);

    // Apply status filter
    if (status) {
      query = query.where('status', '==', status);
    }

    // Apply category filter
    if (category) {
      query = query.where('category', '==', category);
    }

    // Get all documents first for search and sorting
    const allAuctionsSnapshot = await query.get();
    let auctions: any[] = [];

    // Get current time for status calculation
    const now = new Date();

    allAuctionsSnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Calculate actual status based on time
      let actualStatus = data.status;
      const startTime = data.startTime?.toDate?.() || new Date(data.startTime);
      const endTime = data.endTime?.toDate?.() || new Date(data.endTime);
      
      if (now < startTime) {
        actualStatus = 'upcoming';
      } else if (now >= startTime && now < endTime) {
        actualStatus = 'live';
      } else {
        actualStatus = 'ended';
      }

      auctions.push({
        id: doc.id,
        ...data,
        status: actualStatus,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });
    });

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      auctions = auctions.filter(auction =>
        auction.title?.toLowerCase().includes(searchLower) ||
        auction.description?.toLowerCase().includes(searchLower) ||
        auction.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    auctions.sort((a, b) => {
      switch (sort) {
        case 'ending_soon':
          // Sort by time remaining (live auctions first, then by end time)
          if (a.status === 'live' && b.status !== 'live') return -1;
          if (b.status === 'live' && a.status !== 'live') return 1;
          return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'highest_bid':
          return (b.currentBid || b.startingBid || 0) - (a.currentBid || a.startingBid || 0);
        case 'most_bids':
          return (b.bidCount || 0) - (a.bidCount || 0);
        case 'most_watched':
          return (b.watchlistCount || 0) - (a.watchlistCount || 0);
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    // Get unique categories for filters
    const categories = [...new Set(auctions.map(a => a.category).filter(Boolean))];

    // Apply pagination
    const totalAuctions = auctions.length;
    const totalPages = Math.ceil(totalAuctions / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedAuctions = auctions.slice(startIndex, endIndex);

    // Transform auctions for response
    const transformedAuctions = paginatedAuctions.map(auction => ({
      id: auction.id,
      title: auction.title || '',
      currentBid: auction.currentBid || auction.startingBid || 0,
      startingBid: auction.startingBid || 0,
      bidCount: auction.bidCount || 0,
      endTime: auction.endTime,
      status: auction.status,
      category: auction.category || '',
      images: auction.images || [],
      views: auction.views || 0,
      watchlistCount: auction.watchlistCount || 0,
      description: auction.description || '',
      features: auction.features || [],
      tags: auction.tags || [],
      createdAt: auction.createdAt,
      reservePrice: auction.reservePrice || null,
      buyNowPrice: auction.buyNowPrice || null,
    }));

    return NextResponse.json({
      auctions: transformedAuctions,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalAuctions,
        itemsPerPage: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      categories,
    });

  } catch (error) {
    console.error('Error fetching seller auctions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
