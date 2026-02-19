/**
 * Payment - Verify Razorpay Payment
 *
 * POST /api/payment/verify
 *
 * 1. Verifies Razorpay payment signature
 * 2. Creates application orders (one per cart item)
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

import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuthFromRequest } from "@/lib/security/authorization";
import { verifyPaymentSignature } from "@/lib/payment/razorpay";
import {
  cartRepository,
  orderRepository,
  addressRepository,
  productRepository,
} from "@/repositories";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { ValidationError, NotFoundError } from "@/lib/errors";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { serverLogger } from "@/lib/server-logger";
import { sendOrderConfirmationEmail } from "@/lib/email";
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

export async function POST(request: NextRequest) {
  try {
    // 1. Auth
    const user = await requireAuthFromRequest(request);

    // 2. Validate body
    const body = await request.json();
    const validation = verifySchema.safeParse(body);
    if (!validation.success) {
      return ApiErrors.validationError(validation.error.issues);
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      addressId,
      notes,
    } = validation.data;

    // 3. Verify Razorpay signature
    const isValid = verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValid) {
      serverLogger.warn(
        `Payment signature verification failed for user ${user.uid}`,
      );
      throw new ValidationError(ERROR_MESSAGES.CHECKOUT.PAYMENT_FAILED);
    }

    // 4. Load cart
    const cart = await cartRepository.getOrCreate(user.uid);
    if (!cart.items || cart.items.length === 0) {
      throw new ValidationError(ERROR_MESSAGES.CHECKOUT.CART_EMPTY);
    }

    // 5. Resolve address
    const address = await addressRepository.findById(user.uid, addressId);
    if (!address) {
      throw new NotFoundError(ERROR_MESSAGES.CHECKOUT.ADDRESS_REQUIRED);
    }
    const shippingAddress = formatShippingAddress(address);

    // 6. Pre-validate products
    const productChecks = await Promise.all(
      cart.items.map(async (item) => {
        const product = await productRepository.findById(item.productId);
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

    // 7. Create orders (payment already verified — status = "paid")
    const userName = user.displayName ?? user.email ?? "Unknown User";
    const userEmail = user.email ?? "";
    const orderIds: string[] = [];
    let total = 0;
    const emailsToSend: Parameters<typeof sendOrderConfirmationEmail>[0][] = [];

    for (const { item, product } of productChecks) {
      if (!product) continue;

      const unitPrice = item.price;
      const totalPrice = unitPrice * item.quantity;
      total += totalPrice;

      const order = await orderRepository.create({
        productId: item.productId,
        productTitle: item.productTitle,
        userId: user.uid,
        userName,
        userEmail,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        currency: item.currency ?? "INR",
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
          productTitle: item.productTitle,
          quantity: item.quantity,
          totalPrice,
          currency: item.currency ?? "INR",
          shippingAddress,
          paymentMethod: "online",
        });
      }

      // 8. Deduct stock
      await productRepository.updateAvailableQuantity(
        item.productId,
        product.availableQuantity - item.quantity,
      );
    }

    // 9. Clear cart
    await cartRepository.clearCart(user.uid);

    // 10. Send confirmation emails (fire-and-forget)
    if (emailsToSend.length > 0) {
      Promise.all(emailsToSend.map((e) => sendOrderConfirmationEmail(e))).catch(
        (err) => serverLogger.error("Order confirmation email error:", err),
      );
    }

    serverLogger.info(
      `Payment verified & ${orderIds.length} orders placed for user ${user.uid} — payment ${razorpay_payment_id}`,
    );

    return successResponse(
      { orderIds, total, itemCount: orderIds.length },
      SUCCESS_MESSAGES.CHECKOUT.PAYMENT_RECEIVED,
    );
  } catch (error) {
    serverLogger.error("POST /api/payment/verify error:", error);
    return handleApiError(error);
  }
}
