/**
 * Order Cancel API Route
 *
 * Cancel an order (only if pending).
 *
 * @route POST /api/orders/[slug]/cancel - Cancel order (requires auth, ownership)
 */

import { db } from "@/lib/firebase";
import { requireAuth } from "@/lib/session";
import {
  collection,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * POST - Cancel order
 */
export async function POST(request: NextRequest, context: RouteContext) {
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

    // Check if order can be cancelled
    if (orderData.status !== "pending") {
      return NextResponse.json(
        {
          error: "Only pending orders can be cancelled",
          currentStatus: orderData.status,
        },
        { status: 400 },
      );
    }

    // Update order status
    await updateDoc(orderDoc.ref, {
      status: "cancelled",
      cancelledAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Order cancelled successfully",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error cancelling order:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      {
        error: "Failed to cancel order",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
