import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/database/admin";

/**
 * Get analytics overview
 * GET /api/seller/analytics/overview?period=7days|30days|90days|1year|all
 */
export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const decoded = await getAdminAuth().verifyIdToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 },
      );
    }

    const userId = decoded.uid;
    const userRole = (decoded as any).role || "user";

    // Get period from query params
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "30days";

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case "7days":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30days":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90days":
        startDate.setDate(now.getDate() - 90);
        break;
      case "1year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case "all":
        startDate = new Date(0); // Beginning of time
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    const startTimestamp = startDate;

    // Build base query for orders using Admin SDK
    const db = getAdminDb();
    let ordersQuery = db
      .collection("seller_orders")
      .where("createdAt", ">=", startTimestamp)
      .orderBy("createdAt", "desc");

    if (userRole !== "admin") {
      ordersQuery = ordersQuery.where("sellerId", "==", userId);
    }

    const ordersSnap = await ordersQuery.get();
    const orders = ordersSnap.docs.map((doc) => ({
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
      if (["completed", "delivered"].includes(order.status)) {
        totalRevenue += order.total || 0;
      }

      // Customers
      if (order.userId) {
        customerSet.add(order.userId);
      }

      // Product sales
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const productId = item.productId || item.id;
          if (!productSales[productId]) {
            productSales[productId] = {
              name: item.name || "Unknown Product",
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
          createdAt: order.createdAt,
        });
      }
    });

    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get top selling products (top 5)
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((product) => ({
        name: product.name,
        sales: product.sales,
        revenue: product.revenue,
      }));

    // Get low stock products using Admin SDK
    let productsQuery = db
      .collection("seller_products")
      .where("status", "==", "active")
      .orderBy("stock", "asc")
      .limit(10);

    if (userRole !== "admin") {
      productsQuery = db
        .collection("seller_products")
        .where("sellerId", "==", userId)
        .where("status", "==", "active")
        .orderBy("stock", "asc")
        .limit(10);
    }

    const productsSnap = await productsQuery.get();
    const lowStockProducts = productsSnap.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          stock: data.stock || 0,
          lowStockThreshold: data.lowStockThreshold || 10,
        };
      })
      .filter((product) => product.stock <= product.lowStockThreshold)
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
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch analytics",
      },
      { status: 500 },
    );
  }
}
