/**
 * Update Order Status API
 *
 * Seller can update order status (processing, shipped, delivered).
 *
 * @route PUT /api/seller/orders/[id]/status - Update order status (requires seller/admin)
 */

import { db } from "@/lib/firebase";
import { requireRole } from "@/lib/session";
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
    id: string;
  }>;
}

/**
 * PUT - Update order status
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireRole(["seller", "admin"]);
    const userId = session.userId;
    const isAdmin = session.role === "admin";
    const { id } = await context.params;

    const body = await request.json();
    const { status, trackingNumber } = body;

    // Validate status
    const allowedStatuses = ["processing", "shipped", "delivered"];
    if (!status || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be: processing, shipped, delivered" },
        { status: 400 },
      );
    }

    // Get order by slug
    const orderQuery = query(collection(db, "orders"), where("slug", "==", id));
    const orderSnapshot = await getDocs(orderQuery);

    if (orderSnapshot.empty) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const orderDoc = orderSnapshot.docs[0];
    const orderData = orderDoc.data();

    // Verify seller has items in this order
    const hasSellerItems = orderData.items?.some(
      (item: any) => item.sellerId === userId,
    );

    if (!isAdmin && !hasSellerItems) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update order status
    const updateData: any = {
      status,
      updatedAt: serverTimestamp(),
    };

    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }

    if (status === "shipped") {
      updateData.shippedAt = serverTimestamp();
    } else if (status === "delivered") {
      updateData.deliveredAt = serverTimestamp();
    }

    await updateDoc(orderDoc.ref, updateData);

    return NextResponse.json(
      {
        success: true,
        message: "Order status updated successfully",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error updating order status:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      {
        error: "Failed to update order status",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
