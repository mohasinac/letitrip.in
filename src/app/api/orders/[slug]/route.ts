/**
 * Order Details API Route
 *
 * Fetches detailed information about a specific order by slug.
 * Requires authentication and ownership verification.
 *
 * @route GET /api/orders/[slug] - Get order details (requires auth)
 *
 * @example
 * ```tsx
 * const response = await fetch('/api/orders/order-1234567890-abc123');
 * ```
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

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAuth();
    const userId = session.userId;
    const { slug } = await params;

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

    return NextResponse.json(
      {
        success: true,
        data: {
          id: orderDoc.id,
          ...orderData,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching order:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: "Failed to fetch order",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
