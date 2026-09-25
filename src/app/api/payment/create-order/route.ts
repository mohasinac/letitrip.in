import { withPhonePeEnabled } from "@/lib/payment-gate";
import { withProviders } from "@/providers.config";
/**
 * Payment - Create PhonePe Order
 *
 * POST /api/payment/create-order
 *
 * Creates a PhonePe order. Amount is computed server-side from the user's live
 * cart + current Firestore product prices — the client MUST NOT supply an amount.
 * This prevents price-manipulation attacks where a client sends a lower amount.
 *
 * Body: { currency?: string, receipt?: string }
 * Returns: { merchantOrderId, amount (paise), currency, redirectUrl, expireAt, baseAmount, platformFee, gstOnFee } (audit-money-units-ok: PhonePe's own order-object field, natively paise)
 */

import { z } from "zod";
import { computeWhatsAppNotifyFee, computeGiftWrapFee, computeShipmentProtectionFee, computeCheckoutFees, CHECKOUT_DEFAULT_COMMISSIONS, splitCartIntoOrderGroups, resolveShippingCost, lineTotalFor, rupeesToPaise } from "@mohasinac/appkit";
import { getProviders } from "@mohasinac/appkit";
import { siteSettingsRepository, unitOfWork, productRepository } from "@mohasinac/appkit";
import { successResponse, ApiErrors } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { createRouteHandler } from "@mohasinac/appkit";
import { getDefaultCurrency } from "@mohasinac/appkit";
import { isCheckoutValueOtpVerified } from "@mohasinac/appkit/server";
import { SEO_CONFIG } from "@/constants";
import { ROUTES } from "@mohasinac/appkit";

/**
 * Add-on selections are deliberately NOT accepted here. They live on the cart
 * document keyed per store (`CartDocument.storeAddons`), which is the
 * granularity they are billed at — accepting them in the request as well would
 * make the same charge answerable from two places.
 */
const createOrderSchema = z.object({
  currency: z.string().default(getDefaultCurrency()),
  receipt: z.string().optional(),
});

const __POST__g = withProviders(createRouteHandler<(typeof createOrderSchema)["_output"]>({
  auth: true,
  schema: createOrderSchema,
  handler: async ({ user, body }) => {
    const { currency } = body!;
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
      // What this line costs is decided in exactly one place. This route used to
      // hand-roll the rule and reproduced only the bundle branch, silently
      // omitting the locked-price one — so the gateway CAPTURED the seller's list
      // price for an accepted offer or a won auction while the cart displayed
      // the negotiated amount. See `unitPriceFor` in order-math.ts.
      subtotalRs += lineTotalFor(item, product);
    }

    // --- Platform fee + GST (same as verifyAndPlacePhonePeOrderAction) ---
    const siteSettings = await siteSettingsRepository.getSingleton();

    // Tier PP — OTP gate for high-value checkouts. Must run here, BEFORE the
    // PhonePe order is created and payment captured — verifying inside
    // verifyAndPlacePhonePeOrderAction (post-payment) would mean charging
    // the buyer without ever collecting the OTP.
    const otpThreshold = siteSettings?.payment?.otpCheckoutThreshold;
    if (typeof otpThreshold === "number" && otpThreshold > 0 && subtotalRs >= otpThreshold) {
      const verified = await isCheckoutValueOtpVerified(uid);
      if (!verified) {
        throw ApiErrors.forbidden("CHECKOUT_VALUE_OTP_REQUIRED");
      }
    }

    const commissionRates = siteSettings?.commissions ?? CHECKOUT_DEFAULT_COMMISSIONS;
    const minimumTransactionFee = Math.max(0, commissionRates.minimumTransactionFee ?? 0);

    // Was hand-rolled arithmetic here, diverging from every other money path
    // the moment any rule changed (as the ₹10 cap just did). One helper now.
    const { platformFee, gstOnFee } = computeCheckoutFees(subtotalRs, commissionRates);

    // Shipping is charged per resulting order (one per seller-group the cart
    // splits into at order-creation time), same as createPhonePeGroupOrder /
    // createOrderForGroup — reuses the same resolveShippingCost the order
    // that gets placed after payment actually charges/records, so the amount
    // captured here can't fall short of what's later recorded as owed.
    const orderGroups = splitCartIntoOrderGroups(activeItems.map((item) => ({ item })));
    const shippingFeesByGroup = await Promise.all(
      orderGroups.map((group) => resolveShippingCost(group.items[0].item.storeId)),
    );
    const shippingFee = shippingFeesByGroup.reduce((sum, r) => sum + r.shippingFee, 0);

    // Add-ons are per store, read off the cart doc — this route used to charge
    // each add-on ONCE for the whole cart while the orders it later produced
    // charged per store, so the gateway collected less than the orders recorded.
    const addonFees = orderGroups.reduce((sum, group) => {
      const storeId = group.items[0].item.storeId;
      const addons = cart.storeAddons?.[storeId] ?? {};
      const groupSubtotal = group.items.reduce(
        (gs, { item }) => gs + lineTotalFor(item, productById.get(item.productId) ?? null),
        0,
      );
      return (
        sum +
        computeWhatsAppNotifyFee(addons.whatsappNotifyAddon ?? false, commissionRates) +
        computeGiftWrapFee(addons.giftWrapAddon ?? false, commissionRates) +
        computeShipmentProtectionFee(groupSubtotal, addons.shipmentProtectionAddon ?? false, commissionRates)
      );
    }, 0);

    const rawTotal = subtotalRs + platformFee + gstOnFee + addonFees + shippingFee;
    const totalAmount = Math.max(rawTotal, subtotalRs + minimumTransactionFee + addonFees + shippingFee);

    const amountInPaise = rupeesToPaise(totalAmount);

    // PhonePe's `merchantUrls.redirectUrl` is only a fallback destination for
    // the rare case the IFRAME degrades to a full-page redirect — the real
    // confirmation path is the client calling /api/payment/verify (or the
    // webhook, if the buyer's tab is gone by then). See CLAUDE.md's Checkout
    // Lanes / PhonePe integration notes.
    const redirectUrl = `${SEO_CONFIG.siteUrl}${String(ROUTES.USER.CHECKOUT_SUCCESS)}`;

    const phonepeOrder = await getProviders().payment!.createOrder(amountInPaise, currency, {
      uid,
      redirectUrl,
    });

    serverLogger.info(
      `Payment order created: ${phonepeOrder.id} for user ${uid} — base ₹${subtotalRs} + fee ₹${platformFee} + GST ₹${gstOnFee} = ₹${totalAmount}`,
    );

    return successResponse({
      merchantOrderId: phonepeOrder.id,
      amount: phonepeOrder.amount,
      currency: phonepeOrder.currency,
      redirectUrl: phonepeOrder.checkoutUrl,
      expireAt: phonepeOrder.expiresAt,
      platformFee,
      gstOnFee,
      // One figure now, not three: add-ons are per store, so the individual
      // fees only mean something alongside the store they belong to. The
      // per-store split is what /api/checkout/pricing-preview returns.
      addonFees,
      shippingFee,
      baseAmount: subtotalRs,
    });
  },
}));

export const POST = withPhonePeEnabled(__POST__g);
