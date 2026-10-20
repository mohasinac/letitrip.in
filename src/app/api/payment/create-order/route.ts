import { withOnlinePaymentEnabled } from "@/lib/payment-gate";
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
import { rupeesToPaise } from "@mohasinac/appkit/core/money";
import { splitCartIntoOrderGroups } from "@mohasinac/appkit/features/orders/utils/order-splitter";
/* The fee helpers stay on the barrel deliberately: every one of them is defined
 * under appkit's `_internal/` (fees/calculator.ts, features/shipping/
 * protections.ts), which is NOT a published subpath and must not become one —
 * audit-violations.mjs enforces that boundary. The barrel is the sanctioned
 * route to them, so `computeSaleProtectionFee`/`computeProtectionFees` join
 * their siblings here rather than being deep-imported past the boundary. */
import { computeGiftWrapFee, computeShipmentProtectionFee, computeSaleProtectionFee, computeProtectionFees, computeCheckoutFees, CHECKOUT_DEFAULT_COMMISSIONS, resolveShippingCost, lineTotalFor } from "@mohasinac/appkit";
import { getProviders } from "@mohasinac/appkit/contracts/registry";
import { unitOfWork } from "@mohasinac/appkit/core/unit-of-work";
import { siteSettingsRepository } from "@mohasinac/appkit/features/admin/repository/site-settings.repository";
import { productRepository } from "@mohasinac/appkit/features/products/repository/products.repository";
import { successResponse, ApiErrors } from "@mohasinac/appkit/next/api/api-response";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { getDefaultCurrency } from "@mohasinac/appkit/core/baseline-resolver";
/*
 * 🛑 `resolveKeys` comes from `@mohasinac/appkit/server`, NOT from the deep
 * subpath `@mohasinac/appkit/core/integration-keys` — even though that
 * subpath resolves and typechecks fine.
 *
 * The deep import gave this route a SECOND instance of appkit's module graph,
 * and with it a second copy of the provider registry: `initProviders()`
 * registered the session provider into one instance while `createRouteHandler`
 * read the other, found none, and answered **401 UNAUTHENTICATED** to every
 * authenticated request. Measured in production: 10/10 requests 401 on this
 * route and on /api/payment/verify (which inherited the same duplicate through
 * the checkout action), while /api/payment/preorder — same gate, same
 * `auth: true`, same schema, no deep import — returned a normal 400.
 *
 * That is Root Cause #19/#14 (dual module instance breaking a singleton), and
 * the symptom is deliberately recorded here because it does not look like an
 * import problem: a 401 reads as "the session is wrong", not "there are two
 * registries". The rule is one specifier per package per graph — this file
 * already imports from `/server` on the next line, so that is the instance to
 * join. Inside appkit a relative import is correct and unaffected.
 */
import { resolveKeys, isCheckoutValueOtpVerified } from "@mohasinac/appkit/server";
import { SEO_CONFIG } from "@/constants";
import { ROUTES } from "@mohasinac/appkit/next/routing/route-map";

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
      // What this line costs is decided in exactly one place. This route used to
      // hand-roll the rule and reproduced only the bundle branch, silently
      // omitting the locked-price one — so the gateway CAPTURED the seller's list
      // price for an accepted offer or a won auction while the cart displayed
      // the negotiated amount. See `unitPriceFor` in order-math.ts.
      subtotalRs += lineTotalFor(item, product);
    }

    // --- Platform fee + GST (same as verifyAndPlaceGatewayOrderAction) ---
    const siteSettings = await siteSettingsRepository.getSingleton();

    // Tier PP — OTP gate for high-value checkouts. Must run here, BEFORE the
    // PhonePe order is created and payment captured — verifying inside
    // verifyAndPlaceGatewayOrderAction (post-payment) would mean charging
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
    const addonFees = orderGroups.reduce((sum, group, groupIndex) => {
      const storeId = group.items[0].item.storeId;
      const addons = cart.storeAddons?.[storeId] ?? {};
      const groupSubtotal = group.items.reduce(
        (gs, { item }) => gs + lineTotalFor(item, productById.get(item.productId) ?? null),
        0,
      );
      /*
       * ── C5e: the same three protection tiers the order path enforces ──────
       *
       * 🛑 This is the CAPTURE amount. Capturing a protection fee the order
       * path then refuses would charge the buyer more than the order records
       * as owed — the mismatch C0c defect 1 was about, on the add-on axis.
       * `shippingFeesByGroup` is already positionally parallel to
       * `orderGroups` and now carries `storeProtections`, so this costs no
       * extra read.
       */
      const protections = shippingFeesByGroup[groupIndex]?.storeProtections ?? {
        shipping: false,
        sale: false,
      };
      const groupHasFinalSale = group.items.some(
        ({ item }) => productById.get(item.productId)?.finalSale === true,
      );
      const { shippingProtectionFee, saleProtectionFee } = computeProtectionFees({
        subtotal: groupSubtotal,
        selected: {
          shipping: addons.shipmentProtectionAddon ?? false,
          sale: addons.saleProtectionAddon ?? false,
        },
        tiers: {
          platformShipping: commissionRates.shipmentProtectionFeeEnabled === true,
          platformSale: commissionRates.saleProtectionFeeEnabled === true,
          sellerShipping: protections.shipping,
          sellerSale: protections.sale,
          finalSale: groupHasFinalSale,
        },
        shippingFee: (s, sel) => computeShipmentProtectionFee(s, sel, commissionRates),
        saleFee: (s, sel) => computeSaleProtectionFee(s, sel, commissionRates),
      });
      return (
        sum +
        computeGiftWrapFee(addons.giftWrapAddon ?? false, commissionRates) +
        shippingProtectionFee +
        saleProtectionFee
      );
    }, 0);

    /*
     * 🛑 There is deliberately NO product-GST term here, and the history is
     * worth knowing because this line changed twice in one session.
     *
     * C0c defect 1 ADDED one: the three money sites (this route, the order
     * path, the verify guard) all omitted product GST while
     * `previewCheckoutPricing` included it, so the buyer was shown the tax,
     * charged without it, and handed an order recording none — and because all
     * three were wrong together, the mismatch guard could never detect it.
     *
     * The tax-inclusive model then REMOVED it from all five sites at once:
     * every price carries its GST inside, so `subtotalRs` — built from
     * `lineTotalFor` — already contains it. The agreement defect 1 established
     * is intact; the figure the five agree on is now zero-added.
     *
     * Adding it back would charge the tax twice.
     */
    const rawTotal = subtotalRs + platformFee + gstOnFee + addonFees + shippingFee;
    const totalAmount = Math.max(rawTotal, subtotalRs + minimumTransactionFee + addonFees + shippingFee);

    const amountInPaise = rupeesToPaise(totalAmount);

    // PhonePe's `merchantUrls.redirectUrl` is only a fallback destination for
    // the rare case the IFRAME degrades to a full-page redirect — the real
    // confirmation path is the client calling /api/payment/verify (or the
    // webhook, if the buyer's tab is gone by then). See CLAUDE.md's Checkout
    // Lanes / PhonePe integration notes.
    const redirectUrl = `${SEO_CONFIG.siteUrl}${String(ROUTES.USER.CHECKOUT_SUCCESS)}`;

    /*
     * One call for either gateway. `uid` is REQUIRED by PhonePe (packed into
     * its `metaInfo`) and is equally useful to Razorpay (stored in `notes`),
     * because both are how the WEBHOOK path — which has no buyer session —
     * recovers whose cart this was. `redirectUrl` is required by PhonePe's
     * API and ignored by Razorpay, which has no hosted page.
     */
    const payment = getProviders().payment!;
    const gatewayOrder = await payment.createOrder(amountInPaise, currency, {
      uid,
      redirectUrl,
      ...(receipt ? { receipt } : {}),
    });

    serverLogger.info(
      `Payment order created (${payment.name}): ${gatewayOrder.id} for user ${uid} — base ₹${subtotalRs} + fee ₹${platformFee} + GST ₹${gstOnFee} = ₹${totalAmount}`,
    );

    /*
     * 🛑 The Razorpay publishable key is resolved HERE, not sent from the
     * client and not read straight off `process.env`.
     *
     * `resolveKeys()` is the one resolver that knows the Firestore-then-env
     * priority and that a seeded `*_PLACEHOLDER` means "unconfigured" — so
     * reading `process.env.RAZORPAY_KEY_ID` directly (as the pre-migration
     * route did) would hand the browser a different key from the one the
     * server signed the order with the moment an admin set the key in Site
     * Settings. Razorpay then rejects the payment with a key/order mismatch
     * that reads like a gateway fault.
     *
     * The key id is the ONLY credential that legitimately reaches the
     * browser; it is publishable by design. The secret never leaves here.
     */
    const keyId =
      payment.name === "razorpay" ? (await resolveKeys()).razorpayKeyId : undefined;

    return successResponse({
      // Whichever gateway is live, this is the id every later call keys on —
      // `/api/payment/verify`, the webhook, and refunds months from now.
      merchantOrderId: gatewayOrder.id,
      provider: payment.name,
      amount: gatewayOrder.amount,
      currency: gatewayOrder.currency,
      // Razorpay (client-side modal): the browser needs the publishable key.
      ...(keyId ? { keyId } : {}),
      // PhonePe (hosted page): the browser needs somewhere to send the buyer.
      redirectUrl: gatewayOrder.checkoutUrl,
      expireAt: gatewayOrder.expiresAt,
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

export const POST = withOnlinePaymentEnabled(__POST__g);
