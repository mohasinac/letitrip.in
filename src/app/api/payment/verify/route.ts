import "@/providers.config";
import { z } from "zod";
import {
  verifyPaymentSignatureWithKeys, fetchRazorpayOrder, paiseToRupees, } from "@mohasinac/appkit";
import {
  unitOfWork, siteSettingsRepository, offerRepository, userRepository, } from "@mohasinac/appkit";
import { failedCheckoutRepository } from "@mohasinac/appkit";
import { successResponse } from "@mohasinac/appkit";
import {
  ApiError, ValidationError, NotFoundError, } from "@mohasinac/appkit";
import { ERROR_MESSAGES } from "@mohasinac/appkit";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { sendOrderConfirmationEmail } from "@mohasinac/appkit";
import { getAdminRealtimeDb, getAdminDb } from "@mohasinac/appkit";
import { RTDB_PATHS } from "@mohasinac/appkit";
import { createRouteHandler } from "@mohasinac/appkit";
import { splitCartIntoOrderGroups, resolveDate } from "@mohasinac/appkit";
import { ProductStatusValues } from "@mohasinac/appkit";
import { OrderStatusValues, PaymentStatusValues, PaymentMethodValues } from "@mohasinac/appkit";
import { getDefaultCurrency } from "@mohasinac/appkit";

/**
 * Payment - Verify Razorpay Payment
 *
 * POST /api/payment/verify
 *
 * 1. Verifies Razorpay payment signature
 * 2. Splits cart by type+seller → auction=1/item, preorder=1/seller, standard=1/seller
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

import { consentOtpRef } from "@mohasinac/appkit";
import type { AddressDocument } from "@mohasinac/appkit";

const verifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  addressId: z.string().min(1),
  notes: z.string().max(500).optional(),
  /** Platform fee calculated by create-order — re-validated server-side */
  platformFee: z.number().nonnegative().optional(),
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

export const POST = createRouteHandler<(typeof verifySchema)["_output"]>({
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

    // Fetch commission config to recalculate platform fee server-side.
    const siteSettings = await siteSettingsRepository.getSingleton();
    const razorpayFeePercent =
      siteSettings?.commissions?.razorpayFeePercent ?? 5;
    const commissions = siteSettings?.commissions ?? {
      sellerShippingFixed: 50,
      platformShippingPercent: 10,
      platformShippingFixedMin: 50,
    };

    // 3. Verify Razorpay signature
    const isValid = await verifyPaymentSignatureWithKeys({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValid) {
      serverLogger.warn(
        `Payment signature verification failed for user ${user!.uid}`,
      );
      failedCheckoutRepository
        .logPayment(user!.uid, "signature_mismatch", "HMAC signature invalid", {
          gatewayOrderId: razorpay_order_id,
          gatewayPaymentId: razorpay_payment_id,
          addressId,
        })
        .catch(() => {});
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

    // 5b. Verify checkout consent OTP — required for ALL orders (same as COD route).
    //     The buyer verified before opening the Razorpay modal; we read-and-delete
    //     the Firestore doc atomically during the order-create transaction below.
    const db = getAdminDb();
    const otpRef = consentOtpRef(db, user!.uid, addressId);
    {
      const otpSnap = await otpRef.get();
      const otpData = otpSnap.exists
        ? (otpSnap.data() as {
            verified?: boolean;
            expiresAt?: FirebaseFirestore.Timestamp;
          })
        : null;
      const isConsentValid =
        otpData?.verified === true &&
        otpData.expiresAt &&
        (resolveDate(otpData.expiresAt)?.getTime() ?? 0) > Date.now();
      if (!isConsentValid) {
        const reason = !otpData ? "otp_not_verified" : "consent_expired";
        failedCheckoutRepository
          .logPayment(
            user!.uid,
            reason as import("@mohasinac/appkit").FailedPaymentReason,
            "Consent OTP missing or expired at payment verify time",
            {
              gatewayOrderId: razorpay_order_id,
              gatewayPaymentId: razorpay_payment_id,
              addressId,
            },
          )
          .catch(() => {});
        throw new ApiError(
          403,
          "Order verification required. Please complete OTP verification and retry.",
        );
      }
    }

    // 6. Pre-validate products
    const productChecks = await Promise.all(
      cart.items.map(async (item) => {
        const product = await unitOfWork.products.findById(item.productId);
        return { item, product };
      }),
    );

    for (const { item, product } of productChecks) {
      if (!product || product.status !== ProductStatusValues.PUBLISHED) {
        failedCheckoutRepository
          .logPayment(
            user!.uid,
            "product_unavailable",
            `Product ${item.productId} not published`,
            {
              gatewayOrderId: razorpay_order_id,
              gatewayPaymentId: razorpay_payment_id,
              addressId,
            },
          )
          .catch(() => {});
        throw new ValidationError(ERROR_MESSAGES.CHECKOUT.PRODUCT_UNAVAILABLE);
      }
      if (product.availableQuantity < item.quantity) {
        failedCheckoutRepository
          .logPayment(
            user!.uid,
            "stock_insufficient",
            `Product ${item.productId} has ${product.availableQuantity} left, requested ${item.quantity}`,
            {
              gatewayOrderId: razorpay_order_id,
              gatewayPaymentId: razorpay_payment_id,
              addressId,
            },
          )
          .catch(() => {});
        throw new ValidationError(ERROR_MESSAGES.CHECKOUT.INSUFFICIENT_STOCK);
      }
    }

    // 6b. Validate the Razorpay order amount against the server-calculated cart total.
    //     Uses live product prices (not stale cart snapshot) to prevent undercharge
    //     when a seller raises a price AFTER the item was added to the cart.
    {
      const cartSubtotal = productChecks.reduce(
        (sum, { item, product }) => sum + product!.price * item.quantity,
        0,
      );
      const expectedPlatformFee =
        Math.round(cartSubtotal * (razorpayFeePercent / 100) * 100) / 100;
      const expectedPaymentAmountRs = cartSubtotal + expectedPlatformFee;
      const rzpOrderRecord = await fetchRazorpayOrder(razorpay_order_id);
      const paidAmountRs = paiseToRupees(rzpOrderRecord.amount);
      // Allow ₹1 rounding tolerance.
      if (paidAmountRs < expectedPaymentAmountRs - 1) {
        serverLogger.warn(
          `Payment amount mismatch for user ${user!.uid}: paid ₹${paidAmountRs}, expected ≥ ₹${expectedPaymentAmountRs}`,
        );
        failedCheckoutRepository
          .logPayment(
            user!.uid,
            "amount_mismatch",
            `Paid ₹${paidAmountRs}, expected ≥ ₹${expectedPaymentAmountRs}`,
            {
              gatewayOrderId: razorpay_order_id,
              gatewayPaymentId: razorpay_payment_id,
              amountRs: paidAmountRs,
              addressId,
            },
          )
          .catch(() => {});
        throw new ValidationError(ERROR_MESSAGES.CHECKOUT.PAYMENT_FAILED);
      }
    }

    // 7. Split cart into typed order groups (payment verified — status = "confirmed"/"paid")
    //    • auction items   → 1 order per item
    //    • pre-order items → 1 order per seller
    //    • standard items  → 1 order per seller
    const userName =
      (user!["displayName"] as string | null | undefined) ??
      user!.email ??
      "Unknown User";
    const userEmail = user!.email ?? "";

    const orderGroups = splitCartIntoOrderGroups(productChecks);

    const orderIds: string[] = [];
    let total = 0;
    const emailsToSend: Parameters<typeof sendOrderConfirmationEmail>[0][] = [];

    for (const { items: group, orderType } of orderGroups) {
      const firstItem = group[0].item;
      const groupTotal = group.reduce(
        (sum, { item, product }) => sum + product!.price * item.quantity,
        0,
      );

      // -- Shipping fee (same logic as checkout route) ----------------------
      let shippingFee = 0;
      const sellerId = firstItem.sellerId;
      if (sellerId) {
        const sellerUser = await userRepository.findById(sellerId);
        const shippingConfig = sellerUser?.shippingConfig;
        if (shippingConfig?.isConfigured) {
          if (shippingConfig.method === "custom") {
            shippingFee = shippingConfig.customShippingPrice ?? 0;
          } else if (shippingConfig.method === "shiprocket") {
            const percentFee =
              groupTotal * (commissions.platformShippingPercent / 100);
            shippingFee = Math.max(
              percentFee,
              commissions.platformShippingFixedMin,
            );
          }
        }
      }

      // -- Razorpay platform fee --------------------------------------------
      const platformFee =
        Math.round(groupTotal * (razorpayFeePercent / 100) * 100) / 100;
      const orderTotal = groupTotal + shippingFee;

      total += orderTotal;

      const orderItems = group.map(({ item, product }) => ({
        productId: item.productId,
        productTitle: item.productTitle,
        quantity: item.quantity,
        unitPrice: product!.price,
        totalPrice: product!.price * item.quantity,
      }));
      const totalQuantity = group.reduce(
        (sum, { item }) => sum + item.quantity,
        0,
      );

      // -- Collect deduplicated main images for order display convenience ----
      const imageUrls = [
        ...new Set(
          group
            .map(({ product }) => product?.mainImage)
            .filter((url): url is string => typeof url === "string" && url.length > 0),
        ),
      ];

      const order = await unitOfWork.orders.create({
        productId: firstItem.productId,
        productTitle: firstItem.productTitle,
        userId: user!.uid,
        userName,
        userEmail,
        quantity: totalQuantity,
        unitPrice: group[0].product!.price,
        totalPrice: orderTotal,
        currency: firstItem.currency ?? getDefaultCurrency(),
        sellerId: firstItem.sellerId || undefined,
        sellerName: firstItem.sellerName || undefined,
        items: orderItems,
        orderType,
        offerId: firstItem.offerId ?? undefined,
        status: OrderStatusValues.CONFIRMED,
        paymentStatus: PaymentStatusValues.PAID,
        paymentMethod: PaymentMethodValues.ONLINE,
        paymentId: razorpay_payment_id,
        shippingAddress,
        notes,
        platformFee,
        shippingFee: shippingFee > 0 ? shippingFee : undefined,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
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
          totalPrice: orderTotal,
          currency: firstItem.currency ?? getDefaultCurrency(),
          shippingAddress,
          paymentMethod: PaymentMethodValues.ONLINE,
          items: orderItems,
        });
      }
    }

    // 8+9. Atomically deduct stock, clear the cart, and consume the consent OTP doc
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
    // Delete the consent OTP doc — fire-and-forget (single-use; expired anyway)
    otpRef.delete().catch(() => {});

    // 11. Send confirmation emails (fire-and-forget)
    if (emailsToSend.length > 0) {
      Promise.all(emailsToSend.map((e) => sendOrderConfirmationEmail(e))).catch(
        (err: unknown) =>
          serverLogger.error("Order confirmation email error:", err),
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
      .catch((err: unknown) =>
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

