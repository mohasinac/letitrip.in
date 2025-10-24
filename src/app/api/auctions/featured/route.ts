import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const showLive = searchParams.get("live") !== "false";
    const showClosed = searchParams.get("closed") !== "false";
    const limit = parseInt(searchParams.get("limit") || "6");

    const db = getAdminDb();
    let query: any = db.collection('auctions');

    // Filter by status if specific types are requested
    if (showLive && !showClosed) {
      query = query.where('status', '==', 'active');
    } else if (!showLive && showClosed) {
      query = query.where('status', '==', 'ended');
    } else {
      // Show both active and ended auctions
      query = query.where('status', 'in', ['active', 'ended']);
    }

    // Order by total bids and views for "hotness"
    query = query.orderBy('totalBids', 'desc').limit(limit);

    const auctionsSnapshot = await query.get();
    const auctions: any[] = [];

    for (const doc of auctionsSnapshot.docs) {
      const auctionData = doc.data();
      
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

      // Get seller information
      let seller = null;
      if (auctionData.sellerId) {
        try {
          const sellerDoc = await db.collection('users').doc(auctionData.sellerId).get();
          if (sellerDoc.exists) {
            const sellerData = sellerDoc.data();
            seller = {
              id: sellerDoc.id,
              name: sellerData?.displayName || 'Anonymous Seller',
              rating: sellerData?.rating || 5.0
            };
          }
        } catch (error) {
          console.error('Error fetching seller data:', error);
        }
      }

      // Calculate if auction is live
      const now = new Date();
      const endTime = auctionData.endTime?.toDate ? auctionData.endTime.toDate() : new Date(auctionData.endTime);
      const isLive = auctionData.status === 'active' && endTime > now;

      auctions.push({
        id: doc.id,
        title: auctionData.title,
        description: auctionData.description,
        currentBid: auctionData.currentBid || auctionData.startingPrice || 0,
        startingBid: auctionData.startingPrice || 0,
        endTime: endTime.toISOString(),
        image: auctionData.images?.[0]?.url || '/images/placeholder-auction.jpg',
        isLive,
        totalBids: auctionData.bidCount || 0,
        totalViews: auctionData.views || 0,
        watchers: auctionData.watchlistCount || 0,
        seller,
        product,
        status: auctionData.status,
        createdAt: auctionData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      });
    }

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
      { auctions: [], total: 0 },
      { status: 200 }
    );
  }
}
