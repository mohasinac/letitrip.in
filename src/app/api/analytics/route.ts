import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '../lib/session';
import { Collections } from '../lib/firebase/collections';

/**
 * GET /api/analytics
 * Query params:
 * - shop_id: Filter by shop (required for sellers, optional for admins)
 * - start_date: ISO date string
 * - end_date: ISO date string
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user?.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const role = user.role;
    if (!(role === 'seller' || role === 'admin')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shop_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Sellers must provide shop_id
    if (role === 'seller' && !shopId) {
      return NextResponse.json({ 
        success: false, 
        error: 'shop_id is required' 
      }, { status: 400 });
    }

    // Date range
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const end = endDate ? new Date(endDate) : new Date();

    // Build analytics data
    const analytics = {
      revenue: { total: 0, average: 0, trend: 0 },
      orders: { total: 0, pending: 0, completed: 0, cancelled: 0 },
      products: { total: 0, active: 0, outOfStock: 0 },
      customers: { total: 0, new: 0, returning: 0 },
      conversionRate: 0,
      averageOrderValue: 0,
      salesOverTime: [] as any[],
      topProducts: [] as any[],
      revenueByCategory: [] as any[],
    };

    // Fetch orders
    let ordersQuery: FirebaseFirestore.Query = Collections.orders()
      .where('created_at', '>=', start.toISOString())
      .where('created_at', '<=', end.toISOString());

    if (shopId) {
      // Filter by shop - need to query orderItems for shop_id
      const orderItemsSnapshot = await Collections.orderItems()
        .where('shop_id', '==', shopId)
        .get();
      
      const orderIds = [...new Set(orderItemsSnapshot.docs.map((doc: any) => doc.data().order_id))];
      
      if (orderIds.length > 0) {
        // Firestore 'in' query has a limit of 10 items, so we need to batch
        const batches = [];
        for (let i = 0; i < orderIds.length; i += 10) {
          const batch = orderIds.slice(i, i + 10);
          const batchSnapshot = await Collections.orders()
            .where('__name__', 'in', batch)
            .where('created_at', '>=', start.toISOString())
            .where('created_at', '<=', end.toISOString())
            .get();
          batches.push(...batchSnapshot.docs);
        }
        
        const orders = batches.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Calculate revenue
        analytics.revenue.total = orders.reduce((sum: number, order: any) => {
          return sum + (order.total || 0);
        }, 0);
        
        analytics.orders.total = orders.length;
        analytics.orders.pending = orders.filter((o: any) => 
          o.status === 'pending' || o.status === 'confirmed'
        ).length;
        analytics.orders.completed = orders.filter((o: any) => 
          o.status === 'delivered'
        ).length;
        analytics.orders.cancelled = orders.filter((o: any) => 
          o.status === 'cancelled'
        ).length;
        
        analytics.revenue.average = analytics.orders.total > 0 
          ? analytics.revenue.total / analytics.orders.total 
          : 0;
        analytics.averageOrderValue = analytics.revenue.average;
        
        // Get unique customers
        const customerIds = [...new Set(orders.map((o: any) => o.customer_id))];
        analytics.customers.total = customerIds.length;
        
        // Sales over time (group by day)
        const salesByDay = new Map<string, number>();
        orders.forEach((order: any) => {
          const date = new Date(order.created_at).toISOString().split('T')[0];
          salesByDay.set(date, (salesByDay.get(date) || 0) + (order.total || 0));
        });
        
        analytics.salesOverTime = Array.from(salesByDay.entries())
          .map(([date, revenue]) => ({ date, revenue }))
          .sort((a, b) => a.date.localeCompare(b.date));
      }
    } else {
      // Admin view - all shops
      const ordersSnapshot = await ordersQuery.limit(1000).get();
      const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      analytics.revenue.total = orders.reduce((sum: number, order: any) => {
        return sum + (order.total || 0);
      }, 0);
      
      analytics.orders.total = orders.length;
      analytics.orders.pending = orders.filter((o: any) => 
        o.status === 'pending' || o.status === 'confirmed'
      ).length;
      analytics.orders.completed = orders.filter((o: any) => 
        o.status === 'delivered'
      ).length;
      analytics.orders.cancelled = orders.filter((o: any) => 
        o.status === 'cancelled'
      ).length;
      
      analytics.revenue.average = analytics.orders.total > 0 
        ? analytics.revenue.total / analytics.orders.total 
        : 0;
      analytics.averageOrderValue = analytics.revenue.average;
      
      const customerIds = [...new Set(orders.map((o: any) => o.customer_id))];
      analytics.customers.total = customerIds.length;
      
      // Sales over time
      const salesByDay = new Map<string, number>();
      orders.forEach((order: any) => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        salesByDay.set(date, (salesByDay.get(date) || 0) + (order.total || 0));
      });
      
      analytics.salesOverTime = Array.from(salesByDay.entries())
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => a.date.localeCompare(b.date));
    }

    // Fetch products
    if (shopId) {
      const productsSnapshot = await Collections.products()
        .where('shop_id', '==', shopId)
        .get();
      
      const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      analytics.products.total = products.length;
      analytics.products.active = products.filter((p: any) => p.status === 'published').length;
      analytics.products.outOfStock = products.filter((p: any) => (p.stock_count || 0) === 0).length;
      
      // Top products by sales
      const productSales = new Map<string, { name: string; revenue: number; quantity: number }>();
      
      const orderItemsSnapshot = await Collections.orderItems()
        .where('shop_id', '==', shopId)
        .limit(1000)
        .get();
      
      orderItemsSnapshot.docs.forEach((doc: any) => {
        const item: any = doc.data();
        const existing = productSales.get(item.product_id) || { 
          name: item.product_name || 'Unknown', 
          revenue: 0, 
          quantity: 0 
        };
        existing.revenue += (item.price || 0) * (item.quantity || 0);
        existing.quantity += item.quantity || 0;
        productSales.set(item.product_id, existing);
      });
      
      analytics.topProducts = Array.from(productSales.entries())
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
    } else {
      // Admin view
      const productsSnapshot = await Collections.products().limit(1000).get();
      const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      analytics.products.total = products.length;
      analytics.products.active = products.filter((p: any) => p.status === 'published').length;
      analytics.products.outOfStock = products.filter((p: any) => (p.stock_count || 0) === 0).length;
    }

    // Calculate conversion rate (simplified)
    // In real scenario, you'd track page views
    analytics.conversionRate = analytics.customers.total > 0 
      ? (analytics.orders.completed / analytics.customers.total) * 100 
      : 0;

    return NextResponse.json({ 
      success: true, 
      data: analytics 
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch analytics' 
    }, { status: 500 });
  }
}
