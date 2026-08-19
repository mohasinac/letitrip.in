import { withFeatureGuard } from "@/lib/features";
import { withProviders } from "@/providers.config";
/**
 * Payment - Create Razorpay Order
 *
 * POST /api/payment/create-order
 *
 * Creates a Razorpay order. Amount is computed server-side from the user's live
 * cart + current Firestore product prices â€” the client MUST NOT supply an amount.
 * This prevents price-manipulation attacks where a client sends a lower amount.
 *
 * Body: { currency?: string, receipt?: string }
 * Returns: { razorpayOrderId, amount (paise), currency, keyId, baseAmount, platformFee, gstOnFee } (audit-money-units-ok: Razorpay's own order-object field, natively paise)
 */

import { z } from "zod";
import { createRazorpayOrder, rupeesToPaise, computeWhatsAppNotifyFee, computeGiftWrapFee, computeShipmentProtectionFee } from "@mohasinac/appkit";
import { siteSettingsRepository, unitOfWork, productRepository } from "@mohasinac/appkit";
import { successResponse, ApiErrors } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { createRouteHandler } from "@mohasinac/appkit";
import { getDefaultCurrency } from "@mohasinac/appkit";
import { isCheckoutValueOtpVerified } from "@mohasinac/appkit/server";

const createOrderSchema = z.object({
  currency: z.string().default(getDefaultCurrency()),
  receipt: z.string().optional(),
  /** Buyer opted into the ₹10 WhatsApp order-updates addon. Unchecked by default. */
  whatsappNotifyAddon: z.boolean().optional().default(false),
  /** Buyer opted into gift wrap. Unchecked by default. */
  giftWrapAddon: z.boolean().optional().default(false),
  /** Buyer opted into shipment protection. Unchecked by default. */
  shipmentProtectionAddon: z.boolean().optional().default(false),
});

const __POST__g = withProviders(createRouteHandler<(typeof createOrderSchema)["_output"]>({
  auth: true,
  schema: createOrderSchema,
  handler: async ({ user, body }) => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    if (!keyId) throw ApiErrors.internalError("Razorpay is not configured on this server");

    const { currency, receipt, whatsappNotifyAddon, giftWrapAddon, shipmentProtectionAddon } = body!;
    const uid = user!.uid;

    // --- Server-side amount computation from live cart + current product prices ---
    const cart = await unitOfWork.carts.getOrCreate(uid);
    const cartItems = cart.items ?? [];
    if (cartItems.length === 0) {
      throw ApiErrors.badRequest("Your cart is empty.");
    }

    // Fetch current product prices in parallel â€” never trust client-supplied price.
    const selectedIds = cart.selectedItemIds?.length ? new Set(cart.selectedItemIds) : null;
    const activeItems = selectedIds
      ? cartItems.filter((item) => selectedIds.has(item.itemId))
      : cartItems;

    if (activeItems.length === 0) {
      throw ApiErrors.badRequest("No items selected for checkout.");
    }

    const uniqueProductIds = [...new Set(activeItems.map((item) => item.productId))];
    const productDocs = await Promise.all(uniqueProductIds.map((pid) => productRepository.findById(pid)));
    const productById = new Map(
      uniqueProductIds.map((pid, i) => [pid, productDocs[i]]),
    );

    // Validate all products are published and compute subtotal from Firestore prices.
    let subtotalRs = 0;
    for (const item of activeItems) {
      const product = productById.get(item.productId);
      if (!product || product.status !== "published") {
        throw ApiErrors.badRequest(
          `"${item.productTitle}" is no longer available. Please remove it from your cart.`,
        );
      }
      // Bundle cart-lines lock their price at add-time (bundlePrice) — honour it.
      const unitPriceRs = item.bundleCategorySlug && item.bundleProductIds?.length
        ? item.price
        : product.price;
      subtotalRs += unitPriceRs * item.quantity;
    }

    // --- Platform fee + GST (same as verifyAndPlaceRazorpayOrderAction) ---
    const siteSettings = await siteSettingsRepository.getSingleton();

    // Tier PP — OTP gate for high-value checkouts. Must run here, BEFORE the
    // Razorpay order is created and payment captured — verifying inside
    // verifyAndPlaceRazorpayOrderAction (post-payment) would mean charging
    // the card without ever collecting the OTP.
    const otpThreshold = siteSettings?.payment?.otpCheckoutThreshold;
    if (typeof otpThreshold === "number" && otpThreshold > 0 && subtotalRs >= otpThreshold) {
      const verified = await isCheckoutValueOtpVerified(uid);
      if (!verified) {
        throw ApiErrors.forbidden("CHECKOUT_VALUE_OTP_REQUIRED");
      }
    }

    const platformFeePercent = siteSettings?.commissions?.platformFeePercent ?? 5;
    const gstPercent = siteSettings?.commissions?.gstPercent ?? 18;
    const minimumTransactionFee = Math.max(0, siteSettings?.commissions?.minimumTransactionFee ?? 0);

    const platformFee = Math.round(subtotalRs * (platformFeePercent / 100) * 100) / 100;
    const gstOnFee = Math.round(platformFee * (gstPercent / 100) * 100) / 100;
    const whatsappNotifyFee = computeWhatsAppNotifyFee(whatsappNotifyAddon, siteSettings?.commissions ?? {});
    const giftWrapFee = computeGiftWrapFee(giftWrapAddon, siteSettings?.commissions ?? {});
    const shipmentProtectionFee = computeShipmentProtectionFee(subtotalRs, shipmentProtectionAddon, siteSettings?.commissions ?? {});
    const addonFees = whatsappNotifyFee + giftWrapFee + shipmentProtectionFee;
    const rawTotal = subtotalRs + platformFee + gstOnFee + addonFees;
    const totalAmount = Math.max(rawTotal, subtotalRs + minimumTransactionFee + addonFees);

    const amountInPaise = rupeesToPaise(totalAmount);

    const razorpayOrder = await createRazorpayOrder({
      amount: amountInPaise,
      currency,
      receipt: receipt ?? `rcpt_${uid}_${Date.now()}`,
      notes: { userId: uid },
    });

    serverLogger.info(
      `Payment order created: ${razorpayOrder.id} for user ${uid} â€” base â‚¹${subtotalRs} + fee â‚¹${platformFee} + GST â‚¹${gstOnFee} = â‚¹${totalAmount}`,
    );

    return successResponse({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId,
      platformFee,
      gstOnFee,
      whatsappNotifyFee,
      giftWrapFee,
      shipmentProtectionFee,
      baseAmount: subtotalRs,
    });
  },
}));

export const POST = withFeatureGuard("RAZORPAY", __POST__g);
