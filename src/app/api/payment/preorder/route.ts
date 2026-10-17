import { withPhonePeEnabled } from "@/lib/payment-gate";
import { withProviders } from "@/providers.config";
/**
 * Pre-Order Deposit Payment
 *
 * POST /api/payment/preorder
 *
 * Confirms a PhonePe deposit payment for a pre-order product and creates
 * an order document with orderType "preorder".
 *
 * The caller first hits /api/payment/create-order with the depositAmount,
 * opens the PhonePe checkout, then posts the resulting merchantOrderId
 * here together with productId and addressId. There is no client-side
 * signature to verify — PhonePe's Order Status API is the source of truth.
 *
 * Body:
 *   merchantOrderId      — our order id returned by /api/payment/create-order
 *   productId             — Pre-order product being reserved
 *   addressId             — User's selected shipping address ID
 *   notes                 — Optional order notes
 *
 * Returns: { orderId }
 */

import { z } from "zod";
import { getProviders } from "@mohasinac/appkit/contracts/registry";
import { paiseToRupees } from "@mohasinac/appkit/core/money";
import { addressesRepository } from "@mohasinac/appkit/features/addresses/repository/addresses.repository";
import { productRepository } from "@mohasinac/appkit/features/products/repository/products.repository";
import { isPreOrderListing } from "@mohasinac/appkit/features/products/utils/listing-type";
import { orderRepository } from "@mohasinac/appkit";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { NotFoundError } from "@mohasinac/appkit/errors/not-found-error";
import { ValidationError } from "@mohasinac/appkit/errors/validation-error";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { sendOrderConfirmationEmail } from "@mohasinac/appkit/server";
import { OrderStatusValues, PaymentStatusValues, PaymentMethodValues } from "@mohasinac/appkit/features/orders/schemas/firestore";
import { getDefaultCurrency } from "@mohasinac/appkit/core/baseline-resolver";
import { normalizeError } from "@mohasinac/appkit/errors/normalize";

const preorderDepositSchema = z.object({
  merchantOrderId: z.string().min(1),
  productId: z.string().min(1),
  addressId: z.string().min(1),
  notes: z.string().max(500).optional(),
});

const __POST__g = withProviders(createRouteHandler<
  (typeof preorderDepositSchema)["_output"]
>({
  auth: true,
  schema: preorderDepositSchema,
  handler: async ({ user, body }) => {
    const { merchantOrderId, productId, addressId, notes } = body!;

    // 1. Confirm the PhonePe order actually completed — Order Status API is
    // the sole source of truth, there is no client-side signature here.
    const phonepeOrder = await getProviders().payment!.getOrder(merchantOrderId);
    if (phonepeOrder.status !== "paid") {
      serverLogger.warn(
        `Pre-order deposit not completed for user ${user!.uid}`,
        { merchantOrderId, state: phonepeOrder.status },
      );
      throw new ValidationError("Payment verification failed");
    }

    // 2. Actual charged amount, from the confirmed order.
    const depositPaidAmount = paiseToRupees(phonepeOrder.amount);

    // 3. Fetch product for order line-item data
    const product = await productRepository.findById(productId);
    if (!product) throw new NotFoundError("Product not found");
    if (!isPreOrderListing(product))
      throw new ValidationError("Product is not a pre-order item");

    // 4. Fetch user address (SB-UNI-A 2026-05-13 — unified addresses w/ ownerType guard)
    const addressDoc = await addressesRepository.findById(addressId);
    const address =
      addressDoc &&
      addressDoc.ownerType === "user" &&
      addressDoc.ownerId === user!.uid
        ? addressDoc
        : null;
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
    const order = await orderRepository.createOrder({
      productId: product.id,
      productTitle: product.title,
      userId: user!.uid,
      userName: address.fullName ?? user!.email ?? "",
      userEmail: user!.email ?? "",
      storeId: product.storeId,
      storeName: product.storeName,
      orderType: "preorder",
      quantity: 1,
      unitPrice: product.price,
      totalPrice: product.price,
      currency: product.currency ?? getDefaultCurrency(),
      status: OrderStatusValues.CONFIRMED,
      paymentStatus: PaymentStatusValues.PAID,
      paymentId: merchantOrderId,
      paymentMethod: PaymentMethodValues.ONLINE,
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
      currency: product.currency ?? getDefaultCurrency(),
      shippingAddress,
      paymentMethod: PaymentMethodValues.ONLINE,
    }).catch((err) =>
      serverLogger.warn("Pre-order confirmation email failed", {
        error: normalizeError(err).message,
      }),
    );

    serverLogger.info(
      `Pre-order deposit placed: order ${order.id} for product ${productId} by user ${user!.uid} — deposit ₹${depositPaidAmount}`,
    );

    return successResponse({ orderId: order.id });
  },
}));

export const POST = withPhonePeEnabled(__POST__g);
