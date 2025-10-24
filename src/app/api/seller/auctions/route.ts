import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb();
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sort = searchParams.get('sort') || 'newest';
    const status = searchParams.get('status') || 'all';

    if (!sellerId) {
      return NextResponse.json(
        { error: 'Seller ID is required' },
        { status: 400 }
      );
    }

    let query: any = db.collection('auctions').where('sellerId', '==', sellerId);

    // Apply status filter
    if (status !== 'all') {
      query = query.where('status', '==', status);
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
    }

    query = query.limit(limit);

    const auctionsSnapshot = await query.get();
    const auctions: any[] = [];

    for (const doc of auctionsSnapshot.docs) {
      const auctionData = doc.data();
      
      // Calculate metrics
      let views = 0;
      let watchlistCount = 0;
      
      try {
        // Get view count (if tracking views in separate collection)
        const viewsSnapshot = await db.collection('auction_views')
          .where('auctionId', '==', doc.id)
          .get();
        views = viewsSnapshot.size;

        // Get watchlist count
        const watchlistSnapshot = await db.collection('watchlist')
          .where('auctionId', '==', doc.id)
          .get();
        watchlistCount = watchlistSnapshot.size;
      } catch (error) {
        console.error('Error fetching auction metrics:', error);
      }

      auctions.push({
        id: doc.id,
        ...auctionData,
        views,
        watchlistCount,
        createdAt: auctionData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        endTime: auctionData.endTime?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: auctionData.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      });
    }

    return NextResponse.json(auctions);
  } catch (error) {
    console.error('Error fetching seller auctions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch seller auctions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getAdminDb();
    const body = await request.json();
    
    const auctionData = {
      ...body,
      status: 'upcoming',
      currentBid: body.startingBid,
      bidCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection('auctions').add(auctionData);
    
    return NextResponse.json({
      id: docRef.id,
      ...auctionData,
      message: 'Auction created successfully'
    });
  } catch (error) {
    console.error('Error creating auction:', error);
    return NextResponse.json(
      { error: 'Failed to create auction' },
      { status: 500 }
    );
  }
}
