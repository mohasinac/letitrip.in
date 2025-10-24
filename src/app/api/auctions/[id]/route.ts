import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from '@/lib/firebase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: auctionId } = await params;
    const db = getAdminDb();

    // Get auction from database
    const auctionDoc = await db.collection('auctions').doc(auctionId).get();
    
    if (!auctionDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Auction not found" },
        { status: 404 }
      );
    }

    const auctionData = auctionDoc.data();
    
    // Get related product information
    let product = null;
    if (auctionData?.productId) {
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
    if (auctionData?.sellerId) {
      try {
        const sellerDoc = await db.collection('users').doc(auctionData.sellerId).get();
        if (sellerDoc.exists) {
          const sellerData = sellerDoc.data();
          seller = {
            id: sellerDoc.id,
            name: sellerData?.displayName || 'Anonymous Seller',
            rating: sellerData?.rating || 5.0,
            totalSales: sellerData?.totalSales || 0,
            memberSince: sellerData?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            verified: sellerData?.verified || false
          };
        }
      } catch (error) {
        console.error('Error fetching seller data:', error);
      }
    }

    // Get bids
    let bids = [];
    try {
      const bidsSnapshot = await db.collection('bids')
        .where('auctionId', '==', auctionId)
        .orderBy('amount', 'desc')
        .limit(10)
        .get();
      
      for (const bidDoc of bidsSnapshot.docs) {
        const bidData = bidDoc.data();
        
        // Get bidder information
        let bidder = null;
        if (bidData.userId) {
          try {
            const bidderDoc = await db.collection('users').doc(bidData.userId).get();
            if (bidderDoc.exists) {
              const bidderData = bidderDoc.data();
              bidder = {
                id: bidderDoc.id,
                name: bidderData?.displayName || 'Anonymous Bidder'
              };
            }
          } catch (error) {
            console.error('Error fetching bidder data:', error);
          }
        }

        bids.push({
          id: bidDoc.id,
          userId: bidData.userId,
          userName: bidder?.name || 'Anonymous',
          amount: bidData.amount,
          timestamp: bidData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          isWinning: bidData.amount === auctionData?.currentBid
        });
      }
    } catch (error) {
      console.error('Error fetching bids:', error);
    }

    // Get watchlist count
    let watchlistCount = 0;
    try {
      const watchlistSnapshot = await db.collection('watchlist')
        .where('auctionId', '==', auctionId)
        .get();
      watchlistCount = watchlistSnapshot.size;
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    }

    const auction = {
      id: auctionDoc.id,
      title: auctionData?.title || 'Untitled Auction',
      description: auctionData?.description || '',
      images: auctionData?.images || ['/images/placeholder-auction.jpg'],
      currentBid: auctionData?.currentBid || auctionData?.startingPrice || 0,
      startingBid: auctionData?.startingPrice || 0,
      minimumBid: auctionData?.minimumBid || (auctionData?.currentBid || 0) + 50,
      endTime: auctionData?.endTime?.toDate?.()?.toISOString() || new Date().toISOString(),
      status: auctionData?.status || 'upcoming',
      bidCount: auctionData?.bidCount || 0,
      category: auctionData?.category || 'General',
      condition: auctionData?.condition || 'New',
      isAuthentic: auctionData?.isAuthentic !== false,
      seller,
      product,
      bids,
      watchlistCount,
      shippingInfo: auctionData?.shippingInfo || {
        domestic: {
          cost: 99,
          time: "3-5 business days"
        },
        international: {
          available: false
        }
      },
      returnPolicy: auctionData?.returnPolicy || "No returns on auction items unless item is not as described",
      createdAt: auctionData?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: auctionData?.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: auction
    });

  } catch (error) {
    console.error("Get auction error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get auction" },
      { status: 500 }
    );
  }
}
