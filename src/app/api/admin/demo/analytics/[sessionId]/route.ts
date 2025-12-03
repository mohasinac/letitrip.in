import { NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import { COLLECTIONS } from "@/constants/database";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const db = getFirestoreAdmin();
    const { sessionId } = await params;

    // Fetch orders with full data
    const ordersSnap = await db
      .collection(COLLECTIONS.ORDERS)
      .where("demoSession", "==", sessionId)
      .get();

    const orders = ordersSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Calculate analytics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum: number, order: any) => sum + (order.total || 0),
      0,
    );
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Payment method breakdown
    const paymentMethodBreakdown = orders.reduce((acc: any, order: any) => {
      const method = order.paymentMethod || "unknown";
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});

    // Order status breakdown
    const orderStatusBreakdown = orders.reduce((acc: any, order: any) => {
      const status = order.status || "unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Fetch auctions data
    const auctionsSnap = await db
      .collection(COLLECTIONS.AUCTIONS)
      .where("demoSession", "==", sessionId)
      .get();

    const auctions = auctionsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const totalAuctions = auctions.length;
    const activeAuctions = auctions.filter(
      (a: any) => a.status === "active",
    ).length;
    const totalBidsAcrossAuctions = auctions.reduce(
      (sum: number, auction: any) => sum + (auction.totalBids || 0),
      0,
    );

    // User activity (buyers)
    const usersSnap = await db
      .collection(COLLECTIONS.USERS)
      .where("demoSession", "==", sessionId)
      .where("role", "==", "user")
      .get();

    const buyers = usersSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const buyerActivity = buyers.map((buyer: any) => {
      const buyerOrders = orders.filter((o: any) => o.buyerId === buyer.id);
      const buyerSpent = buyerOrders.reduce(
        (sum: number, o: any) => sum + (o.total || 0),
        0,
      );

      return {
        buyerId: buyer.id,
        buyerName: buyer.name,
        totalOrders: buyerOrders.length,
        totalSpent: buyerSpent,
      };
    });

    // Top products by order count
    const productOrderCount = new Map<string, number>();
    orders.forEach((order: any) => {
      order.items?.forEach((item: any) => {
        const count = productOrderCount.get(item.productId) || 0;
        productOrderCount.set(item.productId, count + item.quantity);
      });
    });

    const topProducts = Array.from(productOrderCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([productId, quantity]) => ({
        productId,
        quantity,
      }));

    return NextResponse.json({
      orders: {
        total: totalOrders,
        totalRevenue: Math.round(totalRevenue),
        averageOrderValue: Math.round(averageOrderValue),
        byStatus: orderStatusBreakdown,
        byPaymentMethod: paymentMethodBreakdown,
      },
      auctions: {
        total: totalAuctions,
        active: activeAuctions,
        totalBids: totalBidsAcrossAuctions,
        averageBidsPerAuction:
          totalAuctions > 0
            ? Math.round(totalBidsAcrossAuctions / totalAuctions)
            : 0,
      },
      buyers: {
        total: buyers.length,
        activity: buyerActivity,
      },
      products: {
        topSelling: topProducts,
      },
    });
  } catch (error: any) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
