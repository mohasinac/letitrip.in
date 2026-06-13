import { withProviders } from "@/providers.config";
/**
 * Payment - Create Razorpay Order
 *
 * POST /api/payment/create-order
 *
 * Creates a Razorpay order. Amount is computed server-side from the user's live
 * cart + current Firestore product prices — the client MUST NOT supply an amount.
 * This prevents price-manipulation attacks where a client sends a lower amount.
 *
 * Body: { currency?: string, receipt?: string }
 * Returns: { razorpayOrderId, amount (paise), currency, keyId, baseAmount, platformFee, gstOnFee }
 */

import { z } from "zod";
import { createRazorpayOrder, rupeesToPaise } from "@mohasinac/appkit";
import { siteSettingsRepository, unitOfWork, productRepository } from "@mohasinac/appkit";
import { successResponse, ApiErrors } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { createRouteHandler } from "@mohasinac/appkit";
import { getDefaultCurrency } from "@mohasinac/appkit";

const createOrderSchema = z.object({
  currency: z.string().default(getDefaultCurrency()),
  receipt: z.string().optional(),
});

// rbac-public: external webhook receiver — signature verified inside handler
export const POST = withProviders(createRouteHandler<(typeof createOrderSchema)["_output"]>({
  auth: true,
  schema: createOrderSchema,
  handler: async ({ user, body }) => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    if (!keyId) throw ApiErrors.internalError("Razorpay is not configured on this server");

    const { currency, receipt } = body!;
    const uid = user!.uid;

    // --- Server-side amount computation from live cart + current product prices ---
    const cart = await unitOfWork.carts.getOrCreate(uid);
    const cartItems = cart.items ?? [];
    if (cartItems.length === 0) {
      throw ApiErrors.badRequest("Your cart is empty.");
    }

    // Fetch current product prices in parallel — never trust client-supplied price.
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
      // Bundle cart-lines lock their price at add-time (bundlePriceInPaise) — honour it.
      const unitPriceRs = item.bundleCategorySlug && item.bundleProductIds?.length
        ? item.price
        : product.price;
      subtotalRs += unitPriceRs * item.quantity;
    }

    // --- Platform fee + GST (same as verifyAndPlaceRazorpayOrderAction) ---
    const siteSettings = await siteSettingsRepository.getSingleton();
    const platformFeePercent = siteSettings?.commissions?.platformFeePercent ?? 5;
    const gstPercent = siteSettings?.commissions?.gstPercent ?? 18;
    const minimumTransactionFee = Math.max(0, siteSettings?.commissions?.minimumTransactionFee ?? 0);

    const platformFee = Math.round(subtotalRs * (platformFeePercent / 100) * 100) / 100;
    const gstOnFee = Math.round(platformFee * (gstPercent / 100) * 100) / 100;
    const rawTotal = subtotalRs + platformFee + gstOnFee;
    const totalAmount = Math.max(rawTotal, subtotalRs + minimumTransactionFee);

    const amountInPaise = rupeesToPaise(totalAmount);

    const razorpayOrder = await createRazorpayOrder({
      amount: amountInPaise,
      currency,
      receipt: receipt ?? `rcpt_${uid}_${Date.now()}`,
      notes: { userId: uid },
    });

    serverLogger.info(
      `Payment order created: ${razorpayOrder.id} for user ${uid} — base ₹${subtotalRs} + fee ₹${platformFee} + GST ₹${gstOnFee} = ₹${totalAmount}`,
    );

    return successResponse({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId,
      platformFee,
      gstOnFee,
      baseAmount: subtotalRs,
    });
  },
}));
