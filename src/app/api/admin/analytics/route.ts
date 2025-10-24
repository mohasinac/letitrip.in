import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";
import { getAdminDb } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";

    const db = getAdminDb();
    const now = new Date();
    
    // Calculate date range based on period
    let startDate: Date;
    switch (period) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default: // 30d
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get orders in period
    const ordersSnapshot = await db.collection('orders')
      .where('createdAt', '>=', Timestamp.fromDate(startDate))
      .where('status', 'in', ['confirmed', 'processing', 'shipped', 'delivered'])
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    // Process sales data for chart
    const salesByDay: { [key: string]: number } = {};
    const recentOrders: any[] = [];
    const productSales: { [key: string]: { name: string; sales: number; revenue: number; id: string } } = {};
    
    let totalRevenue = 0;

    ordersSnapshot.forEach((doc: any) => {
      const order = doc.data();
      const orderDate = order.createdAt.toDate();
      const dayKey = orderDate.toISOString().split('T')[0];
      
      // Aggregate sales by day
      salesByDay[dayKey] = (salesByDay[dayKey] || 0) + (order.total || 0);
      totalRevenue += order.total || 0;
      
      // Add to recent orders (limit to 10)
      if (recentOrders.length < 10) {
        recentOrders.push({
          id: doc.id,
          customerName: order.customerInfo?.name || order.customer?.name || 'Guest',
          amount: order.total || 0,
          status: order.status,
          date: orderDate.toISOString().split('T')[0],
          items: order.items?.length || 0
        });
      }
      
      // Aggregate product sales
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const productId = item.productId || item.id;
          if (productId) {
            if (!productSales[productId]) {
              productSales[productId] = {
                id: productId,
                name: item.name || item.title || 'Unknown Product',
                sales: 0,
                revenue: 0
              };
            }
            productSales[productId].sales += item.quantity || 1;
            productSales[productId].revenue += (item.price || 0) * (item.quantity || 1);
          }
        });
      }
    });

    // Prepare sales chart data
    const sortedDates = Object.keys(salesByDay).sort();
    const salesData = {
      labels: sortedDates.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [{
        label: 'Daily Revenue',
        data: sortedDates.map(date => salesByDay[date]),
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        fill: true
      }]
    };

    // Get top products
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Get customer growth data (simplified monthly data)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthOrdersSnapshot = await db.collection('orders')
        .where('createdAt', '>=', Timestamp.fromDate(monthStart))
        .where('createdAt', '<=', Timestamp.fromDate(monthEnd))
        .where('status', 'in', ['confirmed', 'processing', 'shipped', 'delivered'])
        .get();
      
      const monthUsersSnapshot = await db.collection('users')
        .where('createdAt', '>=', Timestamp.fromDate(monthStart))
        .where('createdAt', '<=', Timestamp.fromDate(monthEnd))
        .get();
      
      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        newCustomers: monthUsersSnapshot.size,
        returningCustomers: Math.floor(monthUsersSnapshot.size * 0.3) // Simplified calculation
      });
    }

    const analytics = {
      salesData,
      topProducts,
      recentOrders,
      customerGrowth: monthlyData,
      summary: {
        totalRevenue,
        totalOrders: ordersSnapshot.size,
        averageOrderValue: ordersSnapshot.size > 0 ? totalRevenue / ordersSnapshot.size : 0,
        period
      }
    };

    return NextResponse.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
