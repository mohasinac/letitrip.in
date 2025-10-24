import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const sellerId = searchParams.get('sellerId') || '';
    const sort = searchParams.get('sort') || 'newest';

    let query: any = db.collection('auctions');

    // Apply filters
    if (category) {
      query = query.where('category', '==', category);
    }
    if (status) {
      query = query.where('status', '==', status);
    }
    if (sellerId) {
      query = query.where('sellerId', '==', sellerId);
    }

    // Apply sorting
    if (sort === 'newest') {
      query = query.orderBy('createdAt', 'desc');
    } else if (sort === 'oldest') {
      query = query.orderBy('createdAt', 'asc');
    } else if (sort === 'ending_soon') {
      query = query.where('status', '==', 'live').orderBy('endTime', 'asc');
    } else if (sort === 'highest_bid') {
      query = query.orderBy('currentBid', 'desc');
    } else if (sort === 'most_bids') {
      query = query.orderBy('bidCount', 'desc');
    }

    // Get total count for pagination
    const totalSnapshot = await query.get();
    const total = totalSnapshot.size;

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.limit(limit).offset(offset);

    const auctionsSnapshot = await query.get();
    const auctions: any[] = [];

    for (const doc of auctionsSnapshot.docs) {
      const auctionData = doc.data();
      
      // Get seller information
      let sellerInfo = null;
      if (auctionData.sellerId) {
        try {
          const sellerDoc = await db.collection('users').doc(auctionData.sellerId).get();
          if (sellerDoc.exists) {
            const sellerData = sellerDoc.data();
            sellerInfo = {
              id: sellerDoc.id,
              name: sellerData?.name || 'Unknown Seller',
              email: sellerData?.email || '',
              verified: sellerData?.verificationStatus?.identity || false,
            };
          }
        } catch (error) {
          console.error('Error fetching seller info:', error);
        }
      }

      // Get auction metrics
      let views = 0;
      let watchlistCount = 0;
      
      try {
        const viewsSnapshot = await db.collection('auction_views')
          .where('auctionId', '==', doc.id)
          .get();
        views = viewsSnapshot.size;

        const watchlistSnapshot = await db.collection('watchlist')
          .where('auctionId', '==', doc.id)
          .get();
        watchlistCount = watchlistSnapshot.size;
      } catch (error) {
        console.error('Error fetching auction metrics:', error);
      }

      const auctionItem = {
        id: doc.id,
        ...auctionData,
        seller: sellerInfo,
        views,
        watchlistCount,
        createdAt: auctionData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        endTime: auctionData.endTime?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: auctionData.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      };

      // Apply search filter (client-side for now)
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch = 
          auctionItem.title?.toLowerCase().includes(searchLower) ||
          auctionItem.description?.toLowerCase().includes(searchLower) ||
          auctionItem.category?.toLowerCase().includes(searchLower) ||
          auctionItem.seller?.name?.toLowerCase().includes(searchLower);
        
        if (matchesSearch) {
          auctions.push(auctionItem);
        }
      } else {
        auctions.push(auctionItem);
      }
    }

    // Get categories for filter options
    const categoriesSnapshot = await db.collection('categories').get();
    const categories = categoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      auctions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: offset + limit < total,
      },
      filters: {
        categories,
        statuses: ['upcoming', 'live', 'ended'],
      }
    });
  } catch (error) {
    console.error('Error fetching admin auctions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch auctions' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const db = getAdminDb();
    const body = await request.json();
    const { auctionId, updates } = body;

    if (!auctionId) {
      return NextResponse.json(
        { error: 'Auction ID is required' },
        { status: 400 }
      );
    }

    await db.collection('auctions').doc(auctionId).update({
      ...updates,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      message: 'Auction updated successfully'
    });
  } catch (error) {
    console.error('Error updating auction:', error);
    return NextResponse.json(
      { error: 'Failed to update auction' },
      { status: 500 }
    );
  }
}
