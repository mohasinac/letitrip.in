import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { getAdminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

async function handler(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      shippingAddress,
      paymentMethod,
      items,
      subtotal,
      shipping,
      tax,
      total
    } = body;

    // Validate required fields
    if (!shippingAddress || !paymentMethod || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required order information" },
        { status: 400 }
      );
    }

    const user = (request as any).user;
    const db = getAdminDb();

    // Create order in Firestore
    const orderData = {
      userId: user.userId || user.id,
      status: "processing",
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      shipping,
      tax,
      total,
      trackingNumber: `TRK${Date.now()}`,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    const orderRef = await db.collection('orders').add(orderData);

    // Mock payment processing
    if (paymentMethod === "card") {
      // TODO: Integrate with Razorpay/Stripe payment gateway
      console.log("Processing card payment...");
    }

    // Clear user's cart after successful order
    const cartRef = db.collection('carts').doc(user.userId || user.id);
    await cartRef.delete();

    const newOrder = {
      id: orderRef.id,
      ...orderData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    };

    return NextResponse.json({
      success: true,
      data: newOrder,
      message: "Order placed successfully"
    }, { status: 201 });

  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);
