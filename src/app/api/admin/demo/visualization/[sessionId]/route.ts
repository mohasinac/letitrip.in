import { NextResponse } from "next/server";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import {
  safeToISOString,
  toDateInputValue,
  getTodayDateInputValue,
} from "@/lib/date-utils";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const db = getFirestoreAdmin();
    const { sessionId } = await params;

    // Fetch orders
    const ordersSnap = await db
      .collection("orders")
      .where("demoSession", "==", sessionId)
      .get();

    const orders = ordersSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Revenue over time (daily)
    const revenueByDate = orders.reduce((acc: any, order: any) => {
      const date = order.createdAt?.toDate
        ? toDateInputValue(order.createdAt.toDate())
        : getTodayDateInputValue();

      acc[date] = (acc[date] || 0) + (order.total || 0);
      return acc;
    }, {});

    const revenueTimeSeries = Object.entries(revenueByDate).map(
      ([date, revenue]) => ({
        date,
        revenue: Math.round(revenue as number),
      })
    );

    // Category distribution
    const productsSnap = await db
      .collection("products")
      .where("demoSession", "==", sessionId)
      .get();

    const products = productsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const categoriesSnap = await db
      .collection("categories")
      .where("demoSession", "==", sessionId)
      .get();

    const categoriesMap = new Map(
      categoriesSnap.docs.map((doc) => [doc.id, doc.data().name])
    );

    const categoryDistribution = products.reduce((acc: any, product: any) => {
      const categoryName = categoriesMap.get(product.categoryId) || "Unknown";
      acc[categoryName] = (acc[categoryName] || 0) + 1;
      return acc;
    }, {});

    const categoryData = Object.entries(categoryDistribution).map(
      ([name, count]) => ({
        name,
        count,
      })
    );

    // Order status pie chart
    const statusDistribution = orders.reduce((acc: any, order: any) => {
      const status = order.status || "unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const statusData = Object.entries(statusDistribution).map(
      ([status, count]) => ({
        status,
        count,
      })
    );

    // Payment method distribution
    const paymentDistribution = orders.reduce((acc: any, order: any) => {
      const method = order.paymentMethod || "unknown";
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});

    const paymentData = Object.entries(paymentDistribution).map(
      ([method, count]) => ({
        method,
        count,
      })
    );

    return NextResponse.json({
      revenueTimeSeries,
      categoryDistribution: categoryData,
      orderStatusDistribution: statusData,
      paymentMethodDistribution: paymentData,
    });
  } catch (error: any) {
    console.error("Visualization fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
