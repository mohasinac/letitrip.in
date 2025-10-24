/**
 * Analytics Service
 * Handles complex analytics calculations and data aggregation from Firebase
 */

import { getAdminDb } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

export interface AnalyticsData {
  revenue: {
    total: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  orders: {
    total: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  customers: {
    total: number;
    new: number;
    returning: number;
    change: number;
  };
  products: {
    totalActive: number;
    topPerforming: Array<{
      id: string;
      name: string;
      revenue: number;
      orders: number;
    }>;
  };
  categories: {
    performance: Array<{
      name: string;
      revenue: number;
      orders: number;
      growth: number;
    }>;
  };
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private db = getAdminDb();

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Get comprehensive dashboard analytics
   */
  async getDashboardAnalytics(period: '7d' | '30d' | '90d' = '30d'): Promise<AnalyticsData> {
    const now = new Date();
    const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
    const previousPeriodStart = new Date(startDate.getTime() - periodDays * 24 * 60 * 60 * 1000);

    // Get current period orders
    const currentOrdersSnapshot = await this.db.collection('orders')
      .where('createdAt', '>=', Timestamp.fromDate(startDate))
      .where('status', 'in', ['confirmed', 'processing', 'shipped', 'delivered'])
      .get();

    // Get previous period orders for comparison
    const previousOrdersSnapshot = await this.db.collection('orders')
      .where('createdAt', '>=', Timestamp.fromDate(previousPeriodStart))
      .where('createdAt', '<', Timestamp.fromDate(startDate))
      .where('status', 'in', ['confirmed', 'processing', 'shipped', 'delivered'])
      .get();

    // Calculate revenue metrics
    const currentRevenue = this.calculateTotalRevenue(currentOrdersSnapshot.docs);
    const previousRevenue = this.calculateTotalRevenue(previousOrdersSnapshot.docs);
    const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    // Calculate order metrics
    const currentOrderCount = currentOrdersSnapshot.size;
    const previousOrderCount = previousOrdersSnapshot.size;
    const orderChange = previousOrderCount > 0 ? ((currentOrderCount - previousOrderCount) / previousOrderCount) * 100 : 0;

    // Get customer metrics
    const customerMetrics = await this.getCustomerMetrics(startDate);

    // Get product performance
    const productMetrics = await this.getProductMetrics(currentOrdersSnapshot.docs);

    // Get category performance
    const categoryMetrics = await this.getCategoryMetrics(currentOrdersSnapshot.docs, previousOrdersSnapshot.docs);

    return {
      revenue: {
        total: currentRevenue,
        change: Math.round(revenueChange * 10) / 10,
        trend: revenueChange > 5 ? 'up' : revenueChange < -5 ? 'down' : 'stable',
      },
      orders: {
        total: currentOrderCount,
        change: Math.round(orderChange * 10) / 10,
        trend: orderChange > 5 ? 'up' : orderChange < -5 ? 'down' : 'stable',
      },
      customers: customerMetrics,
      products: productMetrics,
      categories: categoryMetrics,
    };
  }

  /**
   * Get seller-specific analytics
   */
  async getSellerAnalytics(sellerId: string, period: '7d' | '30d' | '90d' = '30d') {
    const now = new Date();
    const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

    // Get seller's products
    const sellerProductsSnapshot = await this.db.collection('products')
      .where('sellerId', '==', sellerId)
      .get();
    
    const productIds = sellerProductsSnapshot.docs.map(doc => doc.id);

    if (productIds.length === 0) {
      return {
        revenue: 0,
        orders: 0,
        products: 0,
        avgOrderValue: 0,
        topProducts: [],
      };
    }

    // Get orders containing seller's products
    const ordersSnapshot = await this.db.collection('orders')
      .where('createdAt', '>=', Timestamp.fromDate(startDate))
      .where('status', 'in', ['confirmed', 'processing', 'shipped', 'delivered'])
      .get();

    let totalRevenue = 0;
    let totalOrders = 0;
    const productPerformance = new Map<string, { revenue: number; orders: number; name: string }>();

    ordersSnapshot.docs.forEach(doc => {
      const order = doc.data();
      const sellerItems = order.items?.filter((item: any) => productIds.includes(item.productId)) || [];
      
      if (sellerItems.length > 0) {
        totalOrders++;
        sellerItems.forEach((item: any) => {
          const itemRevenue = (item.price || 0) * (item.quantity || 1);
          totalRevenue += itemRevenue;

          if (!productPerformance.has(item.productId)) {
            productPerformance.set(item.productId, {
              revenue: 0,
              orders: 0,
              name: item.name || 'Unknown Product',
            });
          }

          const existing = productPerformance.get(item.productId)!;
          existing.revenue += itemRevenue;
          existing.orders += item.quantity || 1;
        });
      }
    });

    // Get top performing products
    const topProducts = Array.from(productPerformance.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      revenue: totalRevenue,
      orders: totalOrders,
      products: productIds.length,
      avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      topProducts,
    };
  }

  private calculateTotalRevenue(orderDocs: any[]): number {
    return orderDocs.reduce((total, doc) => {
      const order = doc.data();
      return total + (order.total || 0);
    }, 0);
  }

  private async getCustomerMetrics(startDate: Date) {
    // Get all users
    const usersSnapshot = await this.db.collection('users').get();
    const totalCustomers = usersSnapshot.size;

    // Get new customers in period
    const newCustomersSnapshot = await this.db.collection('users')
      .where('createdAt', '>=', Timestamp.fromDate(startDate))
      .get();
    const newCustomers = newCustomersSnapshot.size;

    return {
      total: totalCustomers,
      new: newCustomers,
      returning: totalCustomers - newCustomers,
      change: 0, // Would need historical data for this
    };
  }

  private async getProductMetrics(orderDocs: any[]) {
    const productPerformance = new Map<string, { name: string; revenue: number; orders: number }>();

    // Get all active products
    const productsSnapshot = await this.db.collection('products')
      .where('status', '==', 'active')
      .get();

    // Calculate performance from orders
    orderDocs.forEach(doc => {
      const order = doc.data();
      order.items?.forEach((item: any) => {
        if (!productPerformance.has(item.productId)) {
          productPerformance.set(item.productId, {
            name: item.name || 'Unknown Product',
            revenue: 0,
            orders: 0,
          });
        }

        const existing = productPerformance.get(item.productId)!;
        existing.revenue += (item.price || 0) * (item.quantity || 1);
        existing.orders += item.quantity || 1;
      });
    });

    const topPerforming = Array.from(productPerformance.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      totalActive: productsSnapshot.size,
      topPerforming,
    };
  }

  private async getCategoryMetrics(currentOrderDocs: any[], previousOrderDocs: any[]) {
    const currentCategoryPerformance = this.calculateCategoryPerformance(currentOrderDocs);
    const previousCategoryPerformance = this.calculateCategoryPerformance(previousOrderDocs);

    const performance = Array.from(currentCategoryPerformance.entries()).map(([category, current]) => {
      const previous = previousCategoryPerformance.get(category) || { revenue: 0, orders: 0 };
      const growth = previous.revenue > 0 ? ((current.revenue - previous.revenue) / previous.revenue) * 100 : 0;

      return {
        name: category,
        revenue: current.revenue,
        orders: current.orders,
        growth: Math.round(growth * 10) / 10,
      };
    }).sort((a, b) => b.revenue - a.revenue);

    return { performance };
  }

  private calculateCategoryPerformance(orderDocs: any[]) {
    const categoryMap = new Map<string, { revenue: number; orders: number }>();

    orderDocs.forEach(doc => {
      const order = doc.data();
      order.items?.forEach((item: any) => {
        const category = item.category || 'Uncategorized';
        
        if (!categoryMap.has(category)) {
          categoryMap.set(category, { revenue: 0, orders: 0 });
        }

        const existing = categoryMap.get(category)!;
        existing.revenue += (item.price || 0) * (item.quantity || 1);
        existing.orders += item.quantity || 1;
      });
    });

    return categoryMap;
  }

  /**
   * Get real-time metrics
   */
  async getRealTimeMetrics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's orders
    const todayOrdersSnapshot = await this.db.collection('orders')
      .where('createdAt', '>=', Timestamp.fromDate(today))
      .where('status', 'in', ['confirmed', 'processing', 'shipped', 'delivered'])
      .get();

    // Pending orders
    const pendingOrdersSnapshot = await this.db.collection('orders')
      .where('status', 'in', ['pending', 'confirmed'])
      .get();

    // Active auctions
    const activeAuctionsSnapshot = await this.db.collection('auctions')
      .where('status', '==', 'live')
      .get();

    return {
      todayOrders: todayOrdersSnapshot.size,
      todayRevenue: this.calculateTotalRevenue(todayOrdersSnapshot.docs),
      pendingOrders: pendingOrdersSnapshot.size,
      activeAuctions: activeAuctionsSnapshot.size,
    };
  }
}

export const analyticsService = AnalyticsService.getInstance();
