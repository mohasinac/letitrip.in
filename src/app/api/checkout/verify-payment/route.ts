import { NextRequest, NextResponse } from "next/server";
import { Collections } from "../../lib/firebase/collections";
import { getCurrentUser } from "../../lib/session";
import { batchGetOrders, batchGetProducts } from "@/app/api/lib/batch-fetch";
import { z } from "zod";
import crypto from "crypto";

const VerifyPaymentSchema = z.object({
  order_ids: z.array(z.string()).optional(), // Array of order IDs for multi-shop
  order_id: z.string().optional(), // Single order ID for backward compatibility
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = VerifyPaymentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const {
      order_id,
      order_ids,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = validation.data;

    // Support both single order and multiple orders
    const orderIdsToProcess = order_ids || (order_id ? [order_id] : []);

    if (orderIdsToProcess.length === 0) {
      return NextResponse.json(
        { error: "No order IDs provided" },
        { status: 400 }
      );
    }

    // Fetch all orders using batch fetch
    const ordersMap = await batchGetOrders(orderIdsToProcess);

    // Validate all orders exist and belong to user
    for (const orderId of orderIdsToProcess) {
      const order = ordersMap.get(orderId);
      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      if (order.user_id !== user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    // Verify signature
    // In production, use actual Razorpay secret key
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET || "test_secret";
    const generatedSignature = crypto
      .createHmac("sha256", razorpaySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      // In production, log this as potential fraud
      console.error("Payment signature mismatch:", {
        order_ids: orderIdsToProcess,
        razorpay_order_id,
        razorpay_payment_id,
      });

      // Mark all orders as failed
      const failBatch = Collections.orders().firestore.batch();
      for (const orderId of orderIdsToProcess) {
        const orderRef = Collections.orders().doc(orderId);
        failBatch.update(orderRef, {
          payment_status: "failed",
          payment_error: "Signature verification failed",
          updated_at: new Date(),
        });
      }
      await failBatch.commit();

      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Payment verified successfully - update all orders
    const batch = Collections.products().firestore.batch();
    const allProductIds: string[] = [];
    const allCoupons: any[] = [];

    // Update all orders to paid status
    for (const orderId of orderIdsToProcess) {
      const orderRef = Collections.orders().doc(orderId);
      const order = ordersMap.get(orderId);

      batch.update(orderRef, {
        payment_status: "paid",
        razorpay_payment_id,
        paid_at: new Date(),
        updated_at: new Date(),
      });

      // Collect product IDs for stock update
      const productIds =
        order?.items?.map((item: any) => item.product_id) || [];
      allProductIds.push(...productIds);

      // Collect coupons for usage update
      if (order?.coupon?.code) {
        allCoupons.push(order.coupon.code);
      }
    }

    // Fetch and update product stock using batch fetch
    const uniqueProductIds = [...new Set(allProductIds)];
    const productsMap = await batchGetProducts(uniqueProductIds);

    // Calculate total quantity per product across all orders
    const productQuantities: Record<string, number> = {};
    for (const orderId of orderIdsToProcess) {
      const order = ordersMap.get(orderId);
      for (const item of order?.items || []) {
        productQuantities[item.product_id] =
          (productQuantities[item.product_id] || 0) + item.quantity;
      }
    }

    // Update stock
    for (const productId in productQuantities) {
      const product = productsMap.get(productId);
      if (product) {
        const productRef = Collections.products().doc(productId);
        batch.update(productRef, {
          stock_count: Math.max(
            0,
            product.stock_count - productQuantities[productId]
          ),
          updated_at: new Date(),
        });
      }
    }

    // Clear cart
    const cartSnapshot = await Collections.cart()
      .where("user_id", "==", user.id)
      .get();

    cartSnapshot.docs.forEach((doc: any) => {
      batch.delete(doc.ref);
    });

    // Update coupon usage for all used coupons
    const uniqueCoupons = [...new Set(allCoupons)];
    for (const couponCode of uniqueCoupons) {
      const couponSnapshot = await Collections.coupons()
        .where("code", "==", couponCode)
        .limit(1)
        .get();

      if (!couponSnapshot.empty) {
        const couponDoc = couponSnapshot.docs[0];
        batch.update(couponDoc.ref, {
          used_count: (couponDoc.data().used_count || 0) + 1,
          updated_at: new Date(),
        });
      }
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      order_ids: orderIdsToProcess,
      payment_status: "paid",
    });
  } catch (error: any) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}
