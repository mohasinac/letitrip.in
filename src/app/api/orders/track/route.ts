import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/database/admin";

// GET /api/orders/track - Track order by order number and email
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderNumber = searchParams.get("orderNumber");
    const email = searchParams.get("email");

    if (!orderNumber || !email) {
      return NextResponse.json(
        {
          success: false,
          error: "Order number and email are required",
        },
        { status: 400 }
      );
    }

    const db = getAdminDb();

    // Query orders by order number and email
    const ordersSnapshot = await db
      .collection("orders")
      .where("orderNumber", "==", orderNumber.toUpperCase())
      .where("userEmail", "==", email.toLowerCase())
      .limit(1)
      .get();

    if (ordersSnapshot.empty) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found",
        },
        { status: 404 }
      );
    }

    const orderDoc = ordersSnapshot.docs[0];
    const orderData = orderDoc.data();

    return NextResponse.json({
      success: true,
      order: {
        id: orderDoc.id,
        ...orderData,
      },
    });
  } catch (error: any) {
    console.error("Error tracking order:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to track order",
      },
      { status: 500 }
    );
  }
}
