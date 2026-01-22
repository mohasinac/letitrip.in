/**
 * Orders API Routes
 *
 * Create orders and list user orders. Uses session for authentication.
 *
 * @route POST /api/orders - Create new order (requires auth)
 * @route GET /api/orders - List current user's orders (requires auth)
 *
 * @example
 * ```tsx
 * // Create order (uses session automatically)
 * const response = await fetch('/api/orders', {
 *   method: 'POST',
 *   body: JSON.stringify({
 *     items: [...],
 *     shippingAddress: {...},
 *     paymentMethod: 'card'
 *   })
 * });
 *
 * // List orders
 * const response = await fetch('/api/orders?limit=20');
 * ```
 */

import { db } from "@/lib/firebase";
import { requireAuth } from "@/lib/session";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  QueryConstraint,
  serverTimestamp,
  startAfter,
  where,
} from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST - Create new order (requires authentication)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.userId;
    const userEmail = session.email;
    const userName = session.name || userEmail;

    const body = await request.json();
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      couponCode,
    } = body;

    // Validate required fields
    if (!items || !items.length || !shippingAddress) {
      return NextResponse.json(
        { error: "Items and shipping address are required" },
        { status: 400 },
      );
    }

    // Calculate order totals
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0,
    );
    const shippingFee = 50; // Base shipping fee
    const tax = subtotal * 0.18; // 18% GST
    const discount = 0; // Apply coupon if provided
    const total = subtotal + shippingFee + tax - discount;

    // Generate unique order slug
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const orderSlug = `order-${timestamp}-${randomStr}`;

    // Create order document
    const orderData = {
      slug: orderSlug,
      userId,
      userName: userName || "Guest",
      userEmail: userEmail || null,
      items,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod: paymentMethod || "cod",
      couponCode: couponCode || null,
      // Amounts
      subtotal,
      shippingFee,
      tax,
      discount,
      total,
      // Status tracking
      status: "pending", // pending, confirmed, processing, shipped, delivered, cancelled
      paymentStatus: "pending", // pending, paid, failed, refunded
      trackingNumber: null,
      // Timestamps
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      estimatedDelivery: null,
      deliveredAt: null,
    };

    const orderRef = await addDoc(collection(db, "orders"), orderData);

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        data: {
          orderId: orderRef.id,
          orderSlug,
          total,
          status: "pending",
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating order:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create order",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

/**
 * GET - List current user's orders with pagination (requires authentication)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.userId;

    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get("cursor");
    const limitParam = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");

    // Validate and cap limit
    const pageLimit = Math.min(Math.max(limitParam, 1), 100);

    // Build query constraints
    const constraints: QueryConstraint[] = [
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    ];

    // Filter by status if provided
    if (status) {
      constraints.push(where("status", "==", status));
    }

    // Handle cursor pagination
    if (cursor) {
      const cursorDoc = await getDoc(doc(db, "orders", cursor));
      if (cursorDoc.exists()) {
        constraints.push(startAfter(cursorDoc));
      }
    }

    // Add limit
    constraints.push(limit(pageLimit + 1));

    // Execute query
    const ordersQuery = query(collection(db, "orders"), ...constraints);
    const querySnapshot = await getDocs(ordersQuery);

    // Process results
    const orders = querySnapshot.docs.slice(0, pageLimit).map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Check if there's a next page
    const hasMore = querySnapshot.docs.length > pageLimit;
    const nextCursor = hasMore ? querySnapshot.docs[pageLimit - 1].id : null;

    return NextResponse.json(
      {
        success: true,
        data: {
          orders,
          pagination: {
            limit: pageLimit,
            hasMore,
            nextCursor,
          },
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching orders:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch orders",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
}
