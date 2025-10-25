import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { calculateSellerPerformance, calculateConversionRate, calculateWeightedRating, SELLER_CONSTANTS } from '@/lib/api/constants/system';

interface SellerStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  activeProducts: number;
  pendingOrders: number;
  completedOrders: number;
  averageRating: number;
  totalReviews: number;
  revenueChange: number;
  ordersChange: number;
  conversionRate: number;
  monthlyGoal: number;
  goalProgress: number;
}

export const GET = createSellerHandler(async (request: NextRequest, user) => {
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
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        activeProducts: 0,
        pendingOrders: 0,
        completedOrders: 0,
        averageRating: 0,
        totalReviews: 0,
        revenueChange: 0,
        ordersChange: 0,
        conversionRate: 0,
        monthlyGoal: 50000, // Default goal
        goalProgress: 0,
      };
      return NextResponse.json({
        success: true,
        data: emptyStats,
      });
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

    // Calculate product stats
    const totalProducts = sellerProductsSnapshot.size;
    const activeProducts = sellerProductsSnapshot.docs.filter(doc => doc.data().status === 'active').length;
    
    // Calculate completed orders
    const completedOrders = currentMonthOrders.filter(order => 
      ['delivered', 'completed'].includes(order.status)
    ).length;

    // Calculate ratings using real data and system constants
    // Get actual reviews for this seller's products
    const reviewsSnapshot = await db.collection('reviews')
      .where('sellerId', '==', sellerId)
      .where('status', '==', 'approved')
      .get();
    
    const reviews = reviewsSnapshot.docs.map(doc => doc.data());
    const averageRating = calculateWeightedRating(reviews);
    const totalReviews = reviews.length;

    // Calculate performance metrics using system constants
    const avgShippingDays = 3; // This would be calculated from actual order data
    const performanceMetrics = calculateSellerPerformance({
      totalOrders: currentMonthOrders.length,
      completedOrders,
      totalReviews,
      avgShippingDays
    });

    // Calculate changes
    const revenueChange = lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0;
    const ordersChange = lastMonthOrders.length > 0 ? ((currentMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100 : 0;
    const conversionRate = calculateConversionRate(performanceMetrics);

    // Calculate goal progress
    const monthlyGoal = 50000; // Default monthly goal
    const goalProgress = monthlyGoal > 0 ? (currentRevenue / monthlyGoal) * 100 : 0;

    const stats: SellerStats = {
      totalRevenue: currentRevenue,
      totalOrders: currentMonthOrders.length,
      totalProducts,
      activeProducts,
      pendingOrders,
      completedOrders,
      averageRating,
      totalReviews,
      revenueChange: Math.round(revenueChange * 10) / 10,
      ordersChange: Math.round(ordersChange * 10) / 10,
      conversionRate: Math.round(conversionRate * 100) / 100,
      monthlyGoal,
      goalProgress: Math.round(goalProgress * 10) / 10,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching seller stats:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch seller stats' 
      },
      { status: 500 }
    );
  }
});
