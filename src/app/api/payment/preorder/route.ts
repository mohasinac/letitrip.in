import "@/providers.config";
/**
 * Pre-Order Deposit Payment
 *
 * POST /api/payment/preorder
 *
 * Verifies a Razorpay deposit payment for a pre-order product and creates
 * an order document with orderType "preorder".
 *
 * The caller first hits /api/payment/create-order with the depositAmount,
 * opens the Razorpay modal, then posts the resulting payment credentials
 * here together with productId and addressId.
 *
 * Body:
 *   razorpay_order_id    — Razorpay order ID from create-order step
 *   razorpay_payment_id  — Payment ID returned by Razorpay checkout
 *   razorpay_signature   — HMAC-SHA256 signature from Razorpay
 *   productId            — Pre-order product being reserved
 *   addressId            — User's selected shipping address ID
 *   notes                — Optional order notes
 *
 * Returns: { orderId }
 */

import { z } from "zod";
import {
  verifyPaymentSignature,
  fetchRazorpayOrder,
  paiseToRupees,
} from "@/lib/payment/razorpay";
import {
  orderRepository,
  productRepository,
  addressRepository,
} from "@/repositories";
import { successResponse } from "@/lib/api-response";
import { ValidationError, NotFoundError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";
import { createRouteHandler } from "@mohasinac/next";
import { sendOrderConfirmationEmail } from "@/lib/email";

const preorderDepositSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  productId: z.string().min(1),
  addressId: z.string().min(1),
  notes: z.string().max(500).optional(),
});

export const POST = createRouteHandler<
  (typeof preorderDepositSchema)["_output"]
>({
  auth: true,
  schema: preorderDepositSchema,
  handler: async ({ user, body }) => {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      productId,
      addressId,
      notes,
    } = body!;

    // 1. Verify Razorpay signature
    const isValid = verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValid) {
      serverLogger.warn(
        `Pre-order deposit signature verification failed for user ${user!.uid}`,
        { razorpay_order_id },
      );
      throw new ValidationError("Payment signature verification failed");
    }

    // 2. Fetch Razorpay order to know the actual charged amount
    const razorpayOrder = await fetchRazorpayOrder(razorpay_order_id);
    const depositPaidAmount = paiseToRupees(razorpayOrder.amount);

    // 3. Fetch product for order line-item data
    const product = await productRepository.findById(productId);
    if (!product) throw new NotFoundError("Product not found");
    if (!product.isPreOrder)
      throw new ValidationError("Product is not a pre-order item");

    // 4. Fetch user address
    const address = await addressRepository.findById(user!.uid, addressId);
    if (!address) throw new NotFoundError("Address not found");

    const shippingAddress = [
      address.fullName,
      address.addressLine1,
      address.addressLine2,
      address.landmark,
      address.city,
      address.state,
      address.postalCode,
      address.country,
    ]
      .filter(Boolean)
      .join(", ");

    // 5. Create the pre-order document
    const order = await orderRepository.create({
      productId: product.id,
      productTitle: product.title,
      userId: user!.uid,
      userName: address.fullName ?? user!.email ?? "",
      userEmail: user!.email ?? "",
      sellerId: product.sellerId,
      sellerName: product.sellerName,
      orderType: "preorder",
      quantity: 1,
      unitPrice: product.price,
      totalPrice: product.price,
      currency: product.currency ?? "INR",
      status: "confirmed",
      paymentStatus: "paid",
      paymentId: razorpay_payment_id,
      paymentMethod: "razorpay",
      shippingAddress,
      depositAmount: depositPaidAmount,
      codRemainingAmount: product.price - depositPaidAmount,
      notes: notes || undefined,
    });

    // 6. Increment product pre-order count
    if (product.preOrderMaxQuantity != null) {
      await productRepository.update(product.id, {
        preOrderCurrentCount: (product.preOrderCurrentCount ?? 0) + 1,
      });
    }

    // 7. Send confirmation email (non-blocking)
    sendOrderConfirmationEmail({
      to: user!.email ?? "",
      userName: address.fullName ?? "Customer",
      orderId: order.id,
      productTitle: product.title,
      quantity: 1,
      totalPrice: depositPaidAmount,
      currency: product.currency ?? "INR",
      shippingAddress,
      paymentMethod: "Razorpay (Pre-order deposit)",
    }).catch((err) =>
      serverLogger.warn("Pre-order confirmation email failed", { err }),
    );

    serverLogger.info(
      `Pre-order deposit placed: order ${order.id} for product ${productId} by user ${user!.uid} — deposit ₹${depositPaidAmount}`,
    );

    return successResponse({ orderId: order.id });
  },
});
