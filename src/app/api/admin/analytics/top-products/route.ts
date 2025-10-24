import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

interface TopProduct {
  id: string;
  name: string;
  revenue: number;
  orders: number;
  category: string;
}

export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get orders from the last 30 days
    const ordersSnapshot = await db.collection('orders')
      .where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo))
      .where('status', 'in', ['confirmed', 'processing', 'shipped', 'delivered'])
      .get();

    // Aggregate product data
    const productData = new Map<string, {
      name: string;
      revenue: number;
      orders: number;
      category: string;
    }>();

    // Process orders to get product performance
    for (const orderDoc of ordersSnapshot.docs) {
      const order = orderDoc.data();
      
      if (order.items && Array.isArray(order.items)) {
        for (const item of order.items) {
          const productId = item.productId;
          
          if (!productData.has(productId)) {
            // Get product details
            const productDoc = await db.collection('products').doc(productId).get();
            const product = productDoc.exists ? productDoc.data() : null;
            
            productData.set(productId, {
              name: product?.name || item.name || 'Unknown Product',
              revenue: 0,
              orders: 0,
              category: product?.category || 'Uncategorized',
            });
          }

          const existing = productData.get(productId)!;
          existing.revenue += (item.price || 0) * (item.quantity || 1);
          existing.orders += item.quantity || 1;
        }
      }
    }

    // Convert to array and sort by revenue
    const topProducts: TopProduct[] = Array.from(productData.entries())
      .map(([id, data]) => ({
        id,
        ...data,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10); // Top 10 products

    return NextResponse.json(topProducts);
  } catch (error) {
    console.error('Error fetching top products analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top products analytics' },
      { status: 500 }
    );
  }
}
