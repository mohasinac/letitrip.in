/**
 * Orders API Routes
 * 
 * Create orders and list user orders.
 * 
 * @route POST /api/orders - Create new order
 * @route GET /api/orders - List user orders
 * 
 * @example
 * ```tsx
 * // Create order
 * const response = await fetch('/api/orders', {
 *   method: 'POST',
 *   body: JSON.stringify({
 *     userId: 'user-id',
 *     items: [...],
 *     shippingAddress: {...},
 *     paymentMethod: 'card'
 *   })
 * });
 * 
 * // List orders
 * const response = await fetch('/api/orders?userId=user-id&limit=20');
 * ```
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  addDoc,
  doc,
  getDoc,
  serverTimestamp,
  QueryConstraint,
} from "firebase/firestore";

/**
 * POST - Create new order
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      userName,
      userEmail,
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      couponCode,
    } = body;

    // Validate required fields
    if (!userId || !items || !items.length || !shippingAddress) {
      return NextResponse.json(
        { error: "User ID, items, and shipping address are required" },
        { status: 400 }
      );
    }

    // Calculate order totals
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
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
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating order:", error);

    return NextResponse.json(
      {
        error: "Failed to create order",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET - List user orders with pagination
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const cursor = searchParams.get("cursor");
    const limitParam = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

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
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching orders:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch orders",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
