import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/database/admin";
import { verifyFirebaseToken } from "@/lib/auth/firebase-api-auth";
import { CreateOrderInput, Order, OrderStatus, PaymentStatus } from "@/types/order";
import {
  generateOrderNumber,
  calculateOrderTotals,
  validateOrderItems,
} from "@/lib/order/order-utils";
import { FieldValue } from "firebase-admin/firestore";

const ORDERS_COLLECTION = "orders";
const PRODUCTS_COLLECTION = "products";

/**
 * POST /api/orders/create - Create a new order
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyFirebaseToken(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateOrderInput = await request.json();
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      currency,
      exchangeRate,
      customerNotes,
      couponCode,
    } = body;

    // Validate items
    const validation = validateOrderItems(items);
    if (!validation.valid) {
      return NextResponse.json(
        { error: "Invalid order items", details: validation.errors },
        { status: 400 }
      );
    }

    // Validate addresses
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.city) {
      return NextResponse.json(
        { error: "Invalid shipping address" },
        { status: 400 }
      );
    }

    const db = getAdminDb();

    // Check stock availability
    for (const item of items) {
      const productDoc = await db
        .collection(PRODUCTS_COLLECTION)
        .doc(item.productId)
        .get();

      if (!productDoc.exists) {
        return NextResponse.json(
          { error: `Product not found: ${item.name}` },
          { status: 404 }
        );
      }

      const product = productDoc.data();
      const currentStock = product?.stock ?? product?.quantity ?? 0;
      
      if (currentStock < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${item.name}. Available: ${currentStock}`,
          },
          { status: 400 }
        );
      }
    }

    // Calculate totals
    const couponDiscount = 0; // TODO: Apply coupon logic
    const totals = calculateOrderTotals(items, couponDiscount);

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Determine initial status based on payment method
    let initialStatus: OrderStatus = "pending_payment";
    let initialPaymentStatus: PaymentStatus = "pending";

    if (paymentMethod === "cod") {
      initialStatus = "pending_approval";
      initialPaymentStatus = "pending";
    }

    // Create order object
    const order: Omit<Order, "id"> = {
      orderNumber,
      userId: user.uid,
      userName: user.userData?.name || "Unknown",
      userEmail: user.email || "",

      items,

      subtotal: totals.subtotal,
      couponDiscount: totals.discount,
      saleDiscount: 0,
      shippingCharges: totals.shipping,
      platformFee: 0,
      tax: totals.tax,
      total: totals.total,

      currency,
      exchangeRate,
      originalAmount: totals.total,

      paymentMethod,
      paymentStatus: initialPaymentStatus,

      shippingAddress,
      billingAddress: billingAddress || shippingAddress,

      status: initialStatus,

      customerNotes: customerNotes || "",

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save order to database
    const orderRef = await db.collection(ORDERS_COLLECTION).add({
      ...order,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Reduce product stock (in a transaction for safety)
    const batch = db.batch();
    for (const item of items) {
      const productRef = db.collection(PRODUCTS_COLLECTION).doc(item.productId);
      const productDoc = await productRef.get();
      const productData = productDoc.data();
      
      // Update both stock and quantity fields for compatibility
      const updates: any = {
        updatedAt: new Date(),
      };
      
      if (productData?.stock !== undefined) {
        updates.stock = FieldValue.increment(-item.quantity);
      }
      
      if (productData?.quantity !== undefined) {
        updates.quantity = FieldValue.increment(-item.quantity);
      }
      
      batch.update(productRef, updates);
    }
    await batch.commit();

    // TODO: Send order confirmation email
    // TODO: Send notification to seller

    return NextResponse.json({
      success: true,
      orderId: orderRef.id,
      orderNumber,
      order: {
        ...order,
        id: orderRef.id,
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      {
        error: "Failed to create order",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
