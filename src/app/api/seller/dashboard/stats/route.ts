import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

interface SellerStats {
  totalOrders: number;
  totalRevenue: number;
  totalViews: number;
  pendingOrders: number;
  revenueChange: number;
  ordersChange: number;
  viewsChange: number;
  conversionRate: number;
}

export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb();
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');
    
    if (!sellerId) {
      return NextResponse.json(
        { error: 'Seller ID is required' },
        { status: 400 }
      );
    }

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get seller's products
    const sellerProductsSnapshot = await db.collection('products')
      .where('sellerId', '==', sellerId)
      .get();
    
    const productIds = sellerProductsSnapshot.docs.map(doc => doc.id);

    if (productIds.length === 0) {
      // No products, return empty stats
      const emptyStats: SellerStats = {
        totalOrders: 0,
        totalRevenue: 0,
        totalViews: 0,
        pendingOrders: 0,
        revenueChange: 0,
        ordersChange: 0,
        viewsChange: 0,
        conversionRate: 0,
      };
      return NextResponse.json(emptyStats);
    }

    // Get current month orders for seller's products
    const currentMonthOrders: any[] = [];
    const lastMonthOrders: any[] = [];

    // Due to Firestore limitations, we need to get orders and filter on client side
    const allOrdersSnapshot = await db.collection('orders')
      .where('createdAt', '>=', Timestamp.fromDate(lastMonth))
      .get();

    allOrdersSnapshot.forEach((doc: any) => {
      const order = doc.data();
      const orderDate = order.createdAt.toDate();
      
      // Check if order contains seller's products
      const hasSellerProducts = order.items?.some((item: any) => 
        productIds.includes(item.productId)
      );

      if (hasSellerProducts) {
        if (orderDate >= thisMonth) {
          currentMonthOrders.push(order);
        } else if (orderDate >= lastMonth && orderDate <= lastMonthEnd) {
          lastMonthOrders.push(order);
        }
      }
    });

    // Calculate metrics
    let currentRevenue = 0;
    let lastRevenue = 0;
    let pendingOrders = 0;

    currentMonthOrders.forEach(order => {
      const sellerRevenue = order.items
        ?.filter((item: any) => productIds.includes(item.productId))
        .reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0;
      currentRevenue += sellerRevenue;
      
      if (['pending', 'confirmed', 'processing'].includes(order.status)) {
        pendingOrders++;
      }
    });

    lastMonthOrders.forEach(order => {
      const sellerRevenue = order.items
        ?.filter((item: any) => productIds.includes(item.productId))
        .reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0;
      lastRevenue += sellerRevenue;
    });

    // Calculate views (mock for now - you'd implement product view tracking)
    const totalViews = sellerProductsSnapshot.docs.reduce((sum, doc) => {
      const product = doc.data();
      return sum + (product.viewCount || 0);
    }, 0);

    // Calculate changes
    const revenueChange = lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0;
    const ordersChange = lastMonthOrders.length > 0 ? ((currentMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100 : 0;
    const conversionRate = totalViews > 0 ? (currentMonthOrders.length / totalViews) * 100 : 0;

    const stats: SellerStats = {
      totalOrders: currentMonthOrders.length,
      totalRevenue: currentRevenue,
      totalViews,
      pendingOrders,
      revenueChange: Math.round(revenueChange * 10) / 10,
      ordersChange: Math.round(ordersChange * 10) / 10,
      viewsChange: 0, // Would need historical view data
      conversionRate: Math.round(conversionRate * 100) / 100,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching seller stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch seller stats' },
      { status: 500 }
    );
  }
}
