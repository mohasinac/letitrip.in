import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const sort = searchParams.get('sort') || 'newest';

    let query: any = db.collection('orders');

    // Apply sorting
    if (sort === 'newest') {
      query = query.orderBy('createdAt', 'desc');
    } else if (sort === 'oldest') {
      query = query.orderBy('createdAt', 'asc');
    } else if (sort === 'highest_value') {
      query = query.orderBy('total', 'desc');
    }

    // Apply limit
    query = query.limit(limit);

    const ordersSnapshot = await query.get();
    const orders: any[] = [];

    for (const doc of ordersSnapshot.docs) {
      const orderData = doc.data();
      
      // Get user details
      let userName = 'Unknown User';
      if (orderData.userId) {
        try {
          const userDoc = await db.collection('users').doc(orderData.userId).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            userName = userData?.name || userData?.email || 'Unknown User';
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }

      orders.push({
        id: doc.id,
        ...orderData,
        userName,
        createdAt: orderData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: orderData.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        estimatedDelivery: orderData.estimatedDelivery?.toDate?.()?.toISOString(),
        deliveredAt: orderData.deliveredAt?.toDate?.()?.toISOString(),
      });
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent orders' },
      { status: 500 }
    );
  }
}
