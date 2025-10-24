import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

const db = getAdminDb();

export async function GET(
  request: NextRequest,
  { params }: { params: { sellerId: string } }
) {
  try {
    const { sellerId } = params;

    // Get seller info from users collection
    const sellerDoc = await db.collection('users').doc(sellerId).get();
    
    if (!sellerDoc.exists) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }

    const sellerData = sellerDoc.data();

    // Check if user is a seller
    if (!sellerData?.role || !['seller', 'admin'].includes(sellerData.role)) {
      return NextResponse.json(
        { error: 'User is not a seller' },
        { status: 403 }
      );
    }

    // Get seller's products count
    const productsSnapshot = await db
      .collection('products')
      .where('sellerId', '==', sellerId)
      .where('status', '==', 'published')
      .get();

    // Get seller's auctions count
    const auctionsSnapshot = await db
      .collection('auctions')
      .where('sellerId', '==', sellerId)
      .get();

    // Get seller's successful auctions count
    const successfulAuctionsSnapshot = await db
      .collection('auctions')
      .where('sellerId', '==', sellerId)
      .where('status', '==', 'ended')
      .where('winningBid', '>', 0)
      .get();

    // Get seller's orders for total sales
    const ordersSnapshot = await db
      .collection('orders')
      .where('sellerId', '==', sellerId)
      .where('status', 'in', ['completed', 'delivered'])
      .get();

    // Calculate seller rating (simplified - you might want to implement a more complex rating system)
    const reviewsSnapshot = await db
      .collection('reviews')
      .where('sellerId', '==', sellerId)
      .get();

    let totalRating = 0;
    let reviewCount = 0;
    reviewsSnapshot.forEach((doc) => {
      const review = doc.data();
      totalRating += review.rating || 0;
      reviewCount++;
    });

    const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;

    const seller = {
      id: sellerDoc.id,
      name: sellerData.name || '',
      businessName: sellerData.businessName || '',
      email: sellerData.email || '',
      verified: sellerData.verified || false,
      rating: Number(averageRating.toFixed(1)),
      totalProducts: productsSnapshot.size,
      totalAuctions: auctionsSnapshot.size,
      successfulAuctions: successfulAuctionsSnapshot.size,
      totalSales: ordersSnapshot.size,
      joinedDate: sellerData.createdAt || new Date().toISOString(),
      description: sellerData.description || '',
      location: sellerData.location || '',
      avatar: sellerData.avatar || null,
    };

    return NextResponse.json(seller);

  } catch (error) {
    console.error('Error fetching seller info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
