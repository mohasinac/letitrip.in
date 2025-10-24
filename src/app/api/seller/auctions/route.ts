import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { getAuth } from 'firebase-admin/auth';

export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb();
    const { searchParams } = new URL(request.url);
    
    // Get seller ID from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decodedToken = await getAuth().verifyIdToken(token);
    const sellerId = decodedToken.uid;
    
    const limit = parseInt(searchParams.get('limit') || '50');
    const sort = searchParams.get('sort') || 'newest';
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';

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
    let auctions: any[] = [];

    for (const doc of auctionsSnapshot.docs) {
      const auctionData = doc.data();
      
      // Apply search filter
      if (search && !auctionData.title?.toLowerCase().includes(search.toLowerCase()) && 
          !auctionData.description?.toLowerCase().includes(search.toLowerCase())) {
        continue;
      }
      
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

      // Get related product information
      let product = null;
      if (auctionData.productId) {
        try {
          const productDoc = await db.collection('products').doc(auctionData.productId).get();
          if (productDoc.exists) {
            const productData = productDoc.data();
            product = {
              id: productDoc.id,
              name: productData?.name,
              slug: productData?.slug,
              images: productData?.images || [],
              category: productData?.category
            };
          }
        } catch (error) {
          console.error('Error fetching product data:', error);
        }
      }

      auctions.push({
        id: doc.id,
        ...auctionData,
        product,
        views,
        watchlistCount,
        createdAt: auctionData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        startTime: auctionData.startTime?.toDate?.()?.toISOString() || new Date().toISOString(),
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
    
    // Get seller ID from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decodedToken = await getAuth().verifyIdToken(token);
    const sellerId = decodedToken.uid;
    
    const auctionData = {
      ...body,
      sellerId,
      status: 'upcoming',
      currentBid: body.startingPrice || 0,
      bidCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
    };

    const docRef = await db.collection('auctions').add(auctionData);
    
    return NextResponse.json({
      id: docRef.id,
      ...auctionData,
      startTime: auctionData.startTime.toISOString(),
      endTime: auctionData.endTime.toISOString(),
      createdAt: auctionData.createdAt.toISOString(),
      updatedAt: auctionData.updatedAt.toISOString(),
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
