import { NextRequest, NextResponse } from 'next/server';
import { verifySellerSession } from '../../../_lib/auth/admin-auth';
import { Timestamp } from 'firebase-admin/firestore';
import { AuthorizationError } from '../../../_lib/middleware/error-handler';



/**
 * GET /api/seller/analytics/overview?period=7days|30days|90days|1year|all
 * Get analytics overview with period-based filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await verifySellerSession(request);
    const db = getAdminDb();

    // Get period from query params
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30days';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    const startTimestamp = Timestamp.fromDate(startDate);

    // Build orders query
    let ordersQuery: any = db
      .collection('orders')
      .where('createdAt', '>=', startTimestamp)
      .orderBy('createdAt', 'desc');

    if (seller.role !== 'admin') {
      ordersQuery = ordersQuery.where('sellerId', '==', seller.uid);
    }

    const ordersSnap = await ordersQuery.get();
    const orders = ordersSnap.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Calculate statistics
    let totalRevenue = 0;
    let totalOrders = orders.length;
    const customerSet = new Set<string>();
    const productSales: Record<
      string,
      { name: string; sales: number; revenue: number }
    > = {};
    const recentOrders: any[] = [];

    orders.forEach((order: any) => {
      // Revenue (only count completed/delivered orders)
      if (['completed', 'delivered'].includes(order.status)) {
        totalRevenue += order.total || 0;
      }

      // Customers
      if (order.userId) {
        customerSet.add(order.userId);
      }

      // Product sales aggregation
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const productId = item.productId || item.id;
          if (!productSales[productId]) {
            productSales[productId] = {
              name: item.name || 'Unknown Product',
              sales: 0,
              revenue: 0,
            };
          }
          productSales[productId].sales += item.quantity || 1;
          productSales[productId].revenue +=
            (item.price || 0) * (item.quantity || 1);
        });
      }

      // Recent orders (top 5)
      if (recentOrders.length < 5) {
        recentOrders.push({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          total: order.total,
          status: order.status,
          createdAt: order.createdAt?.toDate
            ? order.createdAt.toDate().toISOString()
            : order.createdAt,
        });
      }
    });

    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get top selling products (top 5 by revenue)
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((product) => ({
        name: product.name,
        sales: product.sales,
        revenue: product.revenue,
      }));

    // Get low stock products
    let productsQuery: any = db
      .collection('products')
      .where('status', '==', 'active')
      .orderBy('stock', 'asc')
      .limit(10);

    if (seller.role !== 'admin') {
      productsQuery = db
        .collection('products')
        .where('sellerId', '==', seller.uid)
        .where('status', '==', 'active')
        .orderBy('stock', 'asc')
        .limit(10);
    }

    const productsSnap = await productsQuery.get();
    const lowStockProducts = productsSnap.docs
      .map((doc: any) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          stock: data.stock || 0,
          lowStockThreshold: data.lowStockThreshold || 10,
        };
      })
      .filter((product: any) => product.stock < product.lowStockThreshold)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalRevenue,
          totalOrders,
          averageOrderValue,
          totalCustomers: customerSet.size,
        },
        topProducts,
        recentOrders,
        lowStockProducts,
        period,
      },
    });
  } catch (error: any) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
