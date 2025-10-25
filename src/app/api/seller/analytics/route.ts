import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { createUserHandler } from "@/lib/auth/api-middleware";

interface SellerAnalytics {
  salesData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string;
      borderColor?: string;
    }[];
  };
  topProducts: {
    id: string;
    name: string;
    sales: number;
    revenue: number;
    views: number;
    conversionRate: number;
    image?: string;
  }[];
  recentOrders: {
    id: string;
    customerName: string;
    amount: number;
    status: string;
    date: string;
    items: number;
    paymentStatus: string;
  }[];
  productPerformance: {
    productId: string;
    name: string;
    views: number;
    clicks: number;
    sales: number;
    revenue: number;
    rating: number;
  }[];
  customerInsights: {
    newCustomers: number;
    returningCustomers: number;
    topLocations: { city: string; orders: number }[];
    ageGroups: { range: string; percentage: number }[];
  };
}

export const GET = createUserHandler(async (request: NextRequest, user) => {
  try {
    const db = getAdminDb();
    const { searchParams } = new URL(request.url);
    const providedSellerId = searchParams.get('sellerId');
    const period = searchParams.get('period') || '30d';
    
    // Use the authenticated user's ID if no seller ID is provided
    // Admin users can query any seller's analytics by providing sellerId
    const sellerId = providedSellerId || user.userId;
    
    // Only allow sellers to view their own analytics (unless admin)
    if (user.role === 'seller' && providedSellerId && providedSellerId !== user.userId) {
      return NextResponse.json(
        { error: 'Access denied: Can only view own analytics' },
        { status: 403 }
      );
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default: // 30d
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get seller's products
    const sellerProductsSnapshot = await db.collection('products')
      .where('sellerId', '==', sellerId)
      .get();
    
    const productIds = sellerProductsSnapshot.docs.map(doc => doc.id);
    const productsData = sellerProductsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    if (productIds.length === 0) {
      // No products, return empty analytics
      const emptyAnalytics: SellerAnalytics = {
        salesData: {
          labels: [],
          datasets: [{
            label: 'Sales',
            data: [],
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: 'rgb(59, 130, 246)',
          }]
        },
        topProducts: [],
        recentOrders: [],
        productPerformance: [],
        customerInsights: {
          newCustomers: 0,
          returningCustomers: 0,
          topLocations: [],
          ageGroups: []
        }
      };
      return NextResponse.json({
        success: true,
        data: emptyAnalytics,
      });
    }

    // Get orders within the period for seller's products
    const ordersSnapshot = await db.collection('orders')
      .where('createdAt', '>=', Timestamp.fromDate(startDate))
      .get();

    const sellerOrders = ordersSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter((order: any) => 
        order.items?.some((item: any) => productIds.includes(item.productId))
      );

    // Generate sales data for chart
    const salesData = generateSalesData(sellerOrders, period, startDate, now);

    // Calculate top products
    const topProducts = calculateTopProducts(sellerOrders, productsData);

    // Get recent orders
    const recentOrders = sellerOrders
      .sort((a: any, b: any) => b.createdAt.toDate() - a.createdAt.toDate())
      .slice(0, 10)
      .map((order: any) => ({
        id: order.id,
        customerName: order.customerName || order.customer?.name || 'N/A',
        amount: calculateOrderSellerAmount(order, productIds),
        status: order.status,
        date: order.createdAt.toDate().toISOString(),
        items: order.items?.filter((item: any) => productIds.includes(item.productId)).length || 0,
        paymentStatus: order.paymentStatus || 'pending'
      }));

    // Calculate product performance
    const productPerformance = await calculateProductPerformance(db, productsData, sellerOrders);

    // Calculate customer insights
    const customerInsights = calculateCustomerInsights(sellerOrders);

    const analytics: SellerAnalytics = {
      salesData,
      topProducts,
      recentOrders,
      productPerformance,
      customerInsights
    };

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('Error fetching seller analytics:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch analytics' 
      },
      { status: 500 }
    );
  }
});

function generateSalesData(orders: any[], period: string, startDate: Date, endDate: Date) {
  const labels: string[] = [];
  const data: number[] = [];
  
  // Generate date labels based on period
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    labels.push(period === '7d' ? date.toLocaleDateString('en', { weekday: 'short' }) : dateStr);
    
    // Calculate sales for this date
    const dayOrders = orders.filter((order: any) => {
      const orderDate = order.createdAt.toDate().toISOString().split('T')[0];
      return orderDate === dateStr;
    });
    
    const dayRevenue = dayOrders.reduce((sum: number, order: any) => {
      return sum + calculateOrderSellerAmount(order, order.items?.map((item: any) => item.productId) || []);
    }, 0);
    
    data.push(dayRevenue);
  }

  return {
    labels,
    datasets: [{
      label: 'Sales Revenue',
      data,
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: 'rgb(59, 130, 246)',
    }]
  };
}

function calculateTopProducts(orders: any[], products: any[]) {
  const productStats: { [key: string]: any } = {};

  // Initialize product stats
  products.forEach(product => {
    productStats[product.id] = {
      id: product.id,
      name: product.name,
      sales: 0,
      revenue: 0,
      views: product.views || 0,
      conversionRate: 0,
      image: product.images?.[0]
    };
  });

  // Calculate sales and revenue from orders
  orders.forEach((order: any) => {
    order.items?.forEach((item: any) => {
      if (productStats[item.productId]) {
        productStats[item.productId].sales += item.quantity;
        productStats[item.productId].revenue += item.price * item.quantity;
      }
    });
  });

  // Calculate conversion rates and sort
  return Object.values(productStats)
    .map((product: any) => ({
      ...product,
      conversionRate: product.views > 0 ? (product.sales / product.views) * 100 : 0
    }))
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, 10);
}

function calculateOrderSellerAmount(order: any, productIds: string[]) {
  return order.items
    ?.filter((item: any) => productIds.includes(item.productId))
    .reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0;
}

async function calculateProductPerformance(db: any, products: any[], orders: any[]) {
  const performance = products.map(product => {
    const productOrders = orders.filter((order: any) =>
      order.items?.some((item: any) => item.productId === product.id)
    );

    const sales = productOrders.reduce((sum: number, order: any) => {
      const productItems = order.items?.filter((item: any) => item.productId === product.id) || [];
      return sum + productItems.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0);
    }, 0);

    const revenue = productOrders.reduce((sum: number, order: any) => {
      const productItems = order.items?.filter((item: any) => item.productId === product.id) || [];
      return sum + productItems.reduce((itemSum: number, item: any) => itemSum + (item.price * item.quantity), 0);
    }, 0);

    return {
      productId: product.id,
      name: product.name,
      views: product.views || 0,
      clicks: product.clicks || 0,
      sales,
      revenue,
      rating: product.rating || 0
    };
  });

  return performance.sort((a, b) => b.revenue - a.revenue);
}

function calculateCustomerInsights(orders: any[]) {
  const customers = new Set();
  const locations: { [key: string]: number } = {};
  
  orders.forEach((order: any) => {
    // Track unique customers
    if (order.customerId || order.customer?.id) {
      customers.add(order.customerId || order.customer.id);
    }
    
    // Track locations
    const city = order.shippingAddress?.city || order.customer?.city || 'Unknown';
    locations[city] = (locations[city] || 0) + 1;
  });

  // Sort locations by order count
  const topLocations = Object.entries(locations)
    .map(([city, orders]) => ({ city, orders }))
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 5);

  // Mock age groups data (would need customer data for real implementation)
  const ageGroups = [
    { range: '18-25', percentage: 25 },
    { range: '26-35', percentage: 35 },
    { range: '36-45', percentage: 25 },
    { range: '46-55', percentage: 10 },
    { range: '55+', percentage: 5 }
  ];

  return {
    newCustomers: Math.floor(customers.size * 0.3), // Mock: 30% new customers
    returningCustomers: Math.floor(customers.size * 0.7), // Mock: 70% returning
    topLocations,
    ageGroups
  };
}
