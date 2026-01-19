/**
 * Order Details API Route
 *
 * Fetches detailed information about a specific order by slug.
 *
 * @route GET /api/orders/[slug]
 *
 * @example
 * ```tsx
 * const response = await fetch('/api/orders/order-1234567890-abc123');
 * ```
 */

import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: {
    slug: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = params;

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

    return NextResponse.json(
      {
        error: "Failed to fetch order",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
