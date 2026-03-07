/**
 * Payment - Verify Razorpay Payment
 *
 * POST /api/payment/verify
 *
 * 1. Verifies Razorpay payment signature
 * 2. Groups cart items by sellerId → creates one application order per store
 * 3. Deducts product stock
 * 4. Clears the cart
 * 5. Returns { orderIds, total }
 *
 * Body:
 *   razorpay_order_id    — Razorpay order ID from create-order step
 *   razorpay_payment_id  — Payment ID returned by Razorpay checkout
 *   razorpay_signature   — HMAC-SHA256 signature from Razorpay
 *   addressId            — User's selected shipping address ID
 *   notes                — Optional order notes
 */

import { z } from "zod";
import { verifyPaymentSignature } from "@/lib/payment/razorpay";
import { unitOfWork } from "@/repositories";
import { successResponse } from "@/lib/api-response";
import { ValidationError, NotFoundError } from "@/lib/errors";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { getAdminRealtimeDb } from "@/lib/firebase/admin";
import { RTDB_PATHS } from "@/lib/firebase/realtime-db";
import { createApiHandler } from "@/lib/api/api-handler";
import type { AddressDocument } from "@/db/schema";

const verifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  addressId: z.string().min(1),
  notes: z.string().max(500).optional(),
});

function formatShippingAddress(a: AddressDocument): string {
  return [
    a.fullName,
    a.addressLine1,
    a.addressLine2,
    a.landmark,
    a.city,
    a.state,
    a.postalCode,
    a.country,
  ]
    .filter(Boolean)
    .join(", ");
}

export const POST = createApiHandler<(typeof verifySchema)["_output"]>({
  auth: true,
  schema: verifySchema,
  handler: async ({ user, body }) => {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      addressId,
      notes,
    } = body!;

    // 3. Verify Razorpay signature
    const isValid = verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValid) {
      serverLogger.warn(
        `Payment signature verification failed for user ${user!.uid}`,
      );
      throw new ValidationError(ERROR_MESSAGES.CHECKOUT.PAYMENT_FAILED);
    }

    // 4. Load cart
    const cart = await unitOfWork.carts.getOrCreate(user!.uid);
    if (!cart.items || cart.items.length === 0) {
      throw new ValidationError(ERROR_MESSAGES.CHECKOUT.CART_EMPTY);
    }

    // 5. Resolve address
    const address = await unitOfWork.addresses.findById(user!.uid, addressId);
    if (!address) {
      throw new NotFoundError(ERROR_MESSAGES.CHECKOUT.ADDRESS_REQUIRED);
    }
    const shippingAddress = formatShippingAddress(address);

    // 6. Pre-validate products
    const productChecks = await Promise.all(
      cart.items.map(async (item) => {
        const product = await unitOfWork.products.findById(item.productId);
        return { item, product };
      }),
    );

    for (const { item, product } of productChecks) {
      if (!product || product.status !== "published") {
        throw new ValidationError(ERROR_MESSAGES.CHECKOUT.PRODUCT_UNAVAILABLE);
      }
      if (product.availableQuantity < item.quantity) {
        throw new ValidationError(ERROR_MESSAGES.CHECKOUT.INSUFFICIENT_STOCK);
      }
    }

    // 7. Group items by sellerId → one order per store (payment verified — status = "paid")
    const userName = user!.displayName ?? user!.email ?? "Unknown User";
    const userEmail = user!.email ?? "";

    const byStore = new Map<string, typeof productChecks>();
    for (const check of productChecks) {
      const key = check.item.sellerId || "unknown";
      if (!byStore.has(key)) byStore.set(key, []);
      byStore.get(key)!.push(check);
    }

    const orderIds: string[] = [];
    let total = 0;
    const emailsToSend: Parameters<typeof sendOrderConfirmationEmail>[0][] = [];

    for (const group of byStore.values()) {
      const firstItem = group[0].item;
      const groupTotal = group.reduce(
        (sum, { item }) => sum + item.price * item.quantity,
        0,
      );
      total += groupTotal;

      const orderItems = group.map(({ item }) => ({
        productId: item.productId,
        productTitle: item.productTitle,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
      }));
      const totalQuantity = group.reduce(
        (sum, { item }) => sum + item.quantity,
        0,
      );

      const order = await unitOfWork.orders.create({
        productId: firstItem.productId,
        productTitle: firstItem.productTitle,
        userId: user!.uid,
        userName,
        userEmail,
        quantity: totalQuantity,
        unitPrice: firstItem.price,
        totalPrice: groupTotal,
        currency: firstItem.currency ?? "INR",
        sellerId: firstItem.sellerId || undefined,
        sellerName: firstItem.sellerName || undefined,
        items: orderItems,
        status: "confirmed",
        paymentStatus: "paid",
        paymentMethod: "online",
        paymentId: razorpay_payment_id,
        shippingAddress,
        notes,
      });

      orderIds.push(order.id);

      if (userEmail) {
        emailsToSend.push({
          to: userEmail,
          userName,
          orderId: order.id,
          productTitle:
            orderItems.length > 1
              ? `${orderItems.length} items`
              : firstItem.productTitle,
          quantity: totalQuantity,
          totalPrice: groupTotal,
          currency: firstItem.currency ?? "INR",
          shippingAddress,
          paymentMethod: "online",
          items: orderItems,
        });
      }
    }

    // 8+9. Atomically deduct stock for every item and clear the cart
    //       (batch ensures either ALL stock updates + cart clear succeed, or none do)
    await unitOfWork.runBatch((batch) => {
      for (const { item, product } of productChecks) {
        if (!product) continue;
        unitOfWork.products.updateInBatch(batch, item.productId, {
          availableQuantity: product.availableQuantity - item.quantity,
        } as any);
      }
      unitOfWork.carts.updateInBatch(batch, user!.uid, { items: [] } as any);
    });

    // 10. Send confirmation emails (fire-and-forget)
    if (emailsToSend.length > 0) {
      Promise.all(emailsToSend.map((e) => sendOrderConfirmationEmail(e))).catch(
        (err) => serverLogger.error("Order confirmation email error:", err),
      );
    }

    serverLogger.info(
      `Payment verified & ${orderIds.length} store order(s) placed for user ${user!.uid} — payment ${razorpay_payment_id}`,
    );

    // Signal the RTDB payment event node so usePaymentEvent can navigate the UI.
    // Fire-and-forget — a failed signal is non-critical (webhook provides fallback).
    getAdminRealtimeDb()
      .ref(`${RTDB_PATHS.PAYMENT_EVENTS}/${razorpay_order_id}`)
      .update({ status: "success", orderIds, updatedAt: Date.now() })
      .catch((err) =>
        serverLogger.warn("Payment event RTDB signal failed (non-critical)", {
          err,
        }),
      );

    return successResponse(
      { orderIds, total, itemCount: orderIds.length },
      SUCCESS_MESSAGES.CHECKOUT.PAYMENT_RECEIVED,
    );
  },
});
