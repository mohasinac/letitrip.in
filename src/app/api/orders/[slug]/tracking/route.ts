/**
 * Order Tracking API
 *
 * Get tracking information for an order.
 *
 * @route GET /api/orders/[slug]/tracking - Get tracking info (requires auth, ownership)
 */

import { db } from "@/lib/firebase";
import { requireAuth } from "@/lib/session";
import { collection, getDocs, query, where } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * GET - Get order tracking information
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireAuth();
    const userId = session.userId;
    const { slug } = await context.params;

    // Query order by slug
    const orderQuery = query(
      collection(db, "orders"),
      where("slug", "==", slug),
    );

    const querySnapshot = await getDocs(orderQuery);

    if (querySnapshot.empty) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const orderDoc = querySnapshot.docs[0];
    const orderData = orderDoc.data();

    // Verify ownership
    if (orderData.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Build tracking timeline
    const timeline = [
      {
        status: "pending",
        label: "Order Placed",
        timestamp: orderData.createdAt,
        completed: true,
      },
      {
        status: "processing",
        label: "Processing",
        timestamp: orderData.processingAt || null,
        completed: ["processing", "shipped", "delivered"].includes(
          orderData.status,
        ),
      },
      {
        status: "shipped",
        label: "Shipped",
        timestamp: orderData.shippedAt || null,
        completed: ["shipped", "delivered"].includes(orderData.status),
      },
      {
        status: "delivered",
        label: "Delivered",
        timestamp: orderData.deliveredAt || null,
        completed: orderData.status === "delivered",
      },
    ];

    return NextResponse.json(
      {
        success: true,
        data: {
          orderId: orderDoc.id,
          slug: orderData.slug,
          status: orderData.status,
          trackingNumber: orderData.trackingNumber || null,
          timeline,
          shippingAddress: orderData.shippingAddress,
          estimatedDelivery: orderData.estimatedDelivery || null,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching tracking info:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: "Failed to fetch tracking info",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
