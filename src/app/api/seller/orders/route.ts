import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb();
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sort = searchParams.get('sort') || 'newest';

    if (!sellerId) {
      return NextResponse.json(
        { error: 'Seller ID is required' },
        { status: 400 }
      );
    }

    // Get seller's products first
    const sellerProductsSnapshot = await db.collection('products')
      .where('sellerId', '==', sellerId)
      .get();
    
    const productIds = sellerProductsSnapshot.docs.map(doc => doc.id);

    if (productIds.length === 0) {
      return NextResponse.json([]);
    }

    // Get all orders and filter for seller's products
    let query: any = db.collection('orders');
    
    if (sort === 'newest') {
      query = query.orderBy('createdAt', 'desc');
    } else if (sort === 'oldest') {
      query = query.orderBy('createdAt', 'asc');
    }

    query = query.limit(limit * 3); // Get more to account for filtering

    const ordersSnapshot = await query.get();
    const relevantOrders: any[] = [];

    for (const doc of ordersSnapshot.docs) {
      const orderData = doc.data();
      
      // Check if order contains seller's products
      const sellerItems = orderData.items?.filter((item: any) => 
        productIds.includes(item.productId)
      ) || [];

      if (sellerItems.length > 0) {
        // Calculate seller's portion of the order
        const sellerTotal = sellerItems.reduce((sum: number, item: any) => 
          sum + (item.price * item.quantity), 0);

        // Get customer details
        let customerName = 'Unknown Customer';
        if (orderData.userId) {
          try {
            const userDoc = await db.collection('users').doc(orderData.userId).get();
            if (userDoc.exists) {
              const userData = userDoc.data();
              customerName = userData?.name || userData?.email || 'Unknown Customer';
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        }

        relevantOrders.push({
          id: doc.id,
          orderNumber: orderData.orderNumber,
          status: orderData.status,
          paymentStatus: orderData.paymentStatus,
          total: sellerTotal,
          items: sellerItems,
          customerName,
          shippingAddress: orderData.shippingAddress,
          createdAt: orderData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: orderData.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        });

        if (relevantOrders.length >= limit) {
          break;
        }
      }
    }

    return NextResponse.json(relevantOrders);
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch seller orders' },
      { status: 500 }
    );
  }
}
