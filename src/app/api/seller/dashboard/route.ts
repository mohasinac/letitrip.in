import { NextRequest, NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";
import { safeToISOString } from "@/lib/date-utils";
import {
  requireRole,
  getShopIdFromRequest,
  handleAuthError,
} from "@/app/api/lib/auth-helpers";

/**
 * Calculate average response time from order creation to first status update
 */
function calculateAverageResponseTime(orders: any[]): string {
  if (orders.length === 0) return "N/A";

  // Filter orders that have been updated after creation
  const processedOrders = orders.filter((order: any) => {
    const created = new Date(order.created_at).getTime();
    const updated = new Date(order.updated_at).getTime();
    return updated > created && order.status !== "pending";
  });

  if (processedOrders.length === 0) return "N/A";

  // Calculate average time difference in hours
  const totalHours = processedOrders.reduce((sum: number, order: any) => {
    const created = new Date(order.created_at).getTime();
    const updated = new Date(order.updated_at).getTime();
    const hours = (updated - created) / (1000 * 60 * 60);
    return sum + hours;
  }, 0);

  const avgHours = totalHours / processedOrders.length;

  // Format the response time
  if (avgHours < 1) {
    return "< 1 hour";
  } else if (avgHours < 24) {
    return `${Math.round(avgHours)} hours`;
  } else {
    const days = Math.round(avgHours / 24);
    return `${days} day${days > 1 ? "s" : ""}`;
  }
}

/**
 * Get count of reviews from last 7 days
 */
async function getNewReviewsCount(
  db: FirebaseFirestore.Firestore,
  shopId: string
): Promise<number> {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const reviewsSnapshot = await db
      .collection(COLLECTIONS.REVIEWS)
      .where("shop_id", "==", shopId)
      .where("created_at", ">=", sevenDaysAgo)
      .get();

    return reviewsSnapshot.size;
  } catch (error) {
    console.error("Error fetching new reviews:", error);
    return 0;
  }
}

/**
 * GET /api/seller/dashboard
 * Get seller dashboard statistics
 *
 * Query params:
 * - shop_id (optional - will use user's primary shop if not provided)
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, ["seller", "admin"]);
    const shopId = await getShopIdFromRequest(req, user);

    if (!shopId) {
      return NextResponse.json(
        { error: "No shop found. Please create a shop first." },
        { status: 404 }
      );
    }

    const db = getFirestoreAdmin();

    // Get current date range (last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Get current month date range
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const firstDayOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

    // Get shops stats (only for the specified shop)
    const shopDoc = await db.collection(COLLECTIONS.SHOPS).doc(shopId).get();
    const shopData: any = shopDoc.exists
      ? { id: shopDoc.id, ...shopDoc.data() }
      : null;

    if (!shopData) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    // Count products
    const productsQuery = db
      .collection(COLLECTIONS.PRODUCTS)
      .where("shop_id", "==", shopId);
    const productsSnapshot = await productsQuery.get();
    const allProducts = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const activeProducts = allProducts.filter(
      (p: any) => p.status === "active"
    ).length;

    // Count orders and calculate revenue
    const ordersQuery = db
      .collection(COLLECTIONS.ORDERS)
      .where("shop_id", "==", shopId);
    const ordersSnapshot = await ordersQuery.get();
    const allOrders = ordersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Current month orders
    const currentMonthOrders = allOrders.filter((order: any) => {
      const orderDate = new Date(order.created_at);
      return orderDate >= firstDayOfMonth;
    });

    // Last month orders
    const lastMonthOrders = allOrders.filter((order: any) => {
      const orderDate = new Date(order.created_at);
      return orderDate >= firstDayOfLastMonth && orderDate < firstDayOfMonth;
    });

    // Calculate revenues
    const currentMonthRevenue = currentMonthOrders.reduce(
      (sum: number, order: any) => {
        return sum + (order.total_amount || 0);
      },
      0
    );

    const lastMonthRevenue = lastMonthOrders.reduce(
      (sum: number, order: any) => {
        return sum + (order.total_amount || 0);
      },
      0
    );

    // Order counts by status
    const pendingOrders = allOrders.filter(
      (o: any) => o.status === "pending"
    ).length;
    const totalOrders = allOrders.length;

    // Get recent orders (last 5)
    const recentOrders = allOrders
      .sort((a: any, b: any) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      })
      .slice(0, 5)
      .map((order: any) => ({
        id: order.id,
        orderNumber: order.order_number || `ORD-${order.id.slice(0, 8)}`,
        customer: order.customer_name || "Unknown",
        amount: order.total_amount || 0,
        status: order.status || "pending",
        date: safeToISOString(order.created_at) || new Date().toISOString(),
      }));

    // Get top products by revenue (need to aggregate order items)
    const orderItemsQuery = db
      .collection(COLLECTIONS.ORDER_ITEMS)
      .where("shop_id", "==", shopId);
    const orderItemsSnapshot = await orderItemsQuery.get();
    const orderItems = orderItemsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Aggregate by product
    const productStats = new Map<
      string,
      { name: string; sales: number; revenue: number; views: number }
    >();

    for (const item of orderItems) {
      const itemData = item as any;
      const productId = itemData.product_id;
      const existing = productStats.get(productId);

      if (existing) {
        existing.sales += itemData.quantity || 1;
        existing.revenue += (itemData.price || 0) * (itemData.quantity || 1);
      } else {
        // Get product name
        const productDoc = await db
          .collection(COLLECTIONS.PRODUCTS)
          .doc(productId)
          .get();
        const productData = productDoc.data();

        productStats.set(productId, {
          name: productData?.name || "Unknown Product",
          sales: itemData.quantity || 1,
          revenue: (itemData.price || 0) * (itemData.quantity || 1),
          views: productData?.views || 0,
        });
      }
    }

    // Convert to array and sort by revenue
    const topProducts = Array.from(productStats.entries())
      .map(([id, stats]) => ({ id, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);

    // Build response
    const response = {
      stats: {
        shops: {
          total: 1,
          active: shopData.status === "active" ? 1 : 0,
        },
        products: {
          total: allProducts.length,
          active: activeProducts,
        },
        orders: {
          pending: pendingOrders,
          total: totalOrders,
        },
        revenue: {
          thisMonth: currentMonthRevenue,
          lastMonth: lastMonthRevenue,
        },
      },
      recentOrders,
      topProducts,
      shopPerformance: {
        averageRating: shopData.rating || 0,
        totalRatings: shopData.total_ratings || 0,
        orderFulfillment:
          totalOrders > 0
            ? Math.round(
                (allOrders.filter((o: any) => o.status === "delivered").length /
                  totalOrders) *
                  100
              )
            : 0,
        responseTime: calculateAverageResponseTime(allOrders),
      },
      alerts: {
        lowStock: allProducts.filter(
          (p: any) => p.stock_quantity !== undefined && p.stock_quantity < 5
        ).length,
        pendingShipment: allOrders.filter((o: any) => o.status === "confirmed")
          .length,
        newReviews: await getNewReviewsCount(db, shopId),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    return handleAuthError(error);
  }
}
