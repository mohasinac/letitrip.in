import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/api/lib/session";
import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const user = await getCurrentUser(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { count = 2, userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    if (count < 1 || count > 20) {
      return NextResponse.json(
        { success: false, error: "count must be between 1 and 20" },
        { status: 400 }
      );
    }

    // Get Firestore instance
    const db = getFirestoreAdmin();

    const statuses = ["pending", "processing", "shipped", "delivered"];
    const createdIds: string[] = [];

    // Create orders
    for (let i = 0; i < count; i++) {
      const orderId = `TEST_ORD_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`;
      const orderNumber = `TEST_ORD_${Date.now()}_${i}`;

      // Generate random items (1-5 items per order)
      const itemCount = Math.floor(Math.random() * 5) + 1;
      const items = [];
      let subtotal = 0;

      for (let j = 0; j < itemCount; j++) {
        const price = Math.floor(Math.random() * 50000 + 10000) / 100; // $100-$600
        const quantity = Math.floor(Math.random() * 3) + 1; // 1-3
        items.push({
          productId: `TEST_PROD_${Date.now()}_${j}`,
          name: `TEST_Product #${j + 1}`,
          price,
          quantity,
          total: price * quantity,
        });
        subtotal += price * quantity;
      }

      const shipping = 9.99;
      const tax = Math.floor(subtotal * 0.08 * 100) / 100; // 8% tax
      const total = subtotal + shipping + tax;

      const orderData = {
        id: orderId,
        orderNumber,
        userId,
        items,
        subtotal,
        shipping,
        tax,
        total,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        paymentMethod: "test_card",
        paymentStatus: "paid",
        shippingAddress: {
          fullName: "Test User",
          address: "123 Test St",
          city: "Test City",
          state: "TC",
          zip: "12345",
          country: "US",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.collection("orders").doc(orderId).set(orderData);
      createdIds.push(orderId);
    }

    return NextResponse.json({
      success: true,
      data: { ids: createdIds, count: createdIds.length },
      message: `${createdIds.length} test orders created successfully`
    });
  } catch (error: any) {
    console.error("Error creating test orders:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create test orders" },
      { status: 500 }
    );
  }
}
