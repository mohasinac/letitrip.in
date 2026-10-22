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
import { computeGiftWrapFee, computeShipmentProtectionFee, computeSaleProtectionFee, computeProtectionFees, computeCheckoutFees, allocateCheckoutFees, CHECKOUT_DEFAULT_COMMISSIONS, resolveShippingCost, lineTotalFor, computeCartCouponDiscount, resolveCheckoutItems, allocatePointsAcrossGroups, pointsBaseForGroup, groupEmiQuote, normalizeError } from "@mohasinac/appkit";
/* D46/D47 — the points tender on the CAPTURE amount. The ledger read is a
 * repository call, so it comes from the server entry; the arithmetic is
 * `allocatePointsAcrossGroups` above, shared with the preview and applied in
 * the same group order as the order paths, so all four figures agree by
 * construction rather than by discipline. */
import { pointsRepository } from "@mohasinac/appkit/features/points/repository/points.repository";
import { roundRupees } from "@mohasinac/appkit/utils/number.formatter";

/* S5a — one payer, N destinations. Same pure quote the preview and both order
 * paths use, so the four figures cannot diverge (D37's lesson). */
import {
  countDestinations,
  quoteSharedPurchase,
} from "@mohasinac/appkit/server";
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
/*
 * 🛑 The DEFINING module, not the `@/constants` barrel — and in this route it
 * is load-bearing, not hygiene.
 *
 * `src/constants/index.ts` re-exports `navigation.tsx`, which imports from
 * `@mohasinac/appkit/client` — appkit's `"use client"` entry. Pulling that
 * into a SERVER route's module graph gives the route a second instance of
 * appkit under the client condition, and with it a second, empty copy of the
 * provider registry: `initProviders()` registers the session provider into one
 * instance while `createRouteHandler` reads the other, finds none, and answers
 * **401 UNAUTHENTICATED** to every authenticated request.
 *
 * Measured in production: this route 401'd on 10 of 10 attempts while
 * /api/payment/preorder, /api/payment/otp/request, /api/payment/event/init and
 * /api/payment/verify — same gate, same `auth: true`, same session cookie, same
 * request batch — all passed auth. The discriminator was this one import: it is
 * the only payment route that touched the barrel, for a single string.
 *
 * `src/constants/seo.ts` is a leaf (its only import is the appkit config
 * object), so naming it directly drops `navigation.tsx` and the client entry
 * out of the graph entirely. Root Cause #18's rule — import from the module
 * that DEFINES the symbol — with Root Cause #19/#14 as the cost of ignoring it.
 */
import { SEO_CONFIG } from "@/constants/seo";
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
  /*
   * 🛑 REQUIRED for the WEBHOOK path to be able to place an order at all, and
   * its absence is the confirmed cause of a live incident (D64).
   *
   * The buyer-present path gets these from `/api/payment/verify`, whose schema
   * requires `addressId`. The webhook has no session, so it recovers them from
   * the gateway's own passthrough channel — PhonePe's `metaInfo`, Razorpay's
   * `notes` — which is what `PhonePeCheckoutIntent` describes and what
   * `packMetaInfo` writes into `udf2`/`udf3`.
   *
   * That intent was declared and never populated: this route passed only
   * `{ uid, redirectUrl, receipt }`. So on the webhook path `addressId` was
   * always empty and every physical-goods placement threw `ADDRESS_REQUIRED`
   * — which then left the claim doc as a tombstone and made the buyer's own
   * retry impossible. Measured on `order_TqJvzY4gVjR2cc`: ₹2,511.80 captured,
   * no order, manual refund.
   *
   * Optional rather than required because a digital-only cart legitimately has
   * no address — `cartIsDigitalOnly` gates the same check at settle time.
   */
  addressId: z.string().min(1).optional(),
  outOfStockPolicy: z.enum(["cancel_order", "skip_items"]).default("cancel_order"),
});

const __POST__g = withProviders(createRouteHandler<(typeof createOrderSchema)["_output"]>({
  auth: true,
  schema: createOrderSchema,
  handler: async ({ user, body }) => {
    const { currency, receipt, addressId, outOfStockPolicy } = body!;
    const uid = user!.uid;

    // --- Server-side amount computation from live cart + current product prices ---
    const cart = await unitOfWork.carts.getOrCreate(uid);
    const cartItems = cart.items ?? [];
    if (cartItems.length === 0) {
      throw ApiErrors.badRequest("Your cart is empty.");
    }

    /*
     * Validate the address BEFORE a payment session exists.
     *
     * The settle path checks this too — but by then the buyer has been
     * debited, so a bad address becomes "money taken, order failed", which is
     * precisely the D64 failure class. Failing here costs one read and the
     * buyer simply picks a different address with no money moved.
     *
     * Ownership is checked, not just existence: an address id belonging to
     * someone else must not become a shipping destination.
     */
    if (addressId) {
      const addressDoc = await unitOfWork.addresses.findById(addressId);
      if (!addressDoc || addressDoc.ownerType !== "user" || addressDoc.ownerId !== uid) {
        throw ApiErrors.badRequest("That delivery address is no longer available.");
      }
    }

    /*
     * 🛑 D40 — WHAT WE CHARGE FOR MUST BE WHAT WE SETTLE, and this line was
     * the overcharging half of a two-way divergence.
     *
     * It used to read:
     *
     *   const activeItems = selectedIds
     *     ? cartItems.filter((i) => selectedIds.has(i.itemId))
     *     : cartItems;                      // ← the WHOLE cart, every lane
     *
     * while the settle path used `defaultCheckoutItems`, i.e. the active lane
     * and nothing else. So with no explicit selection a buyer was **charged for
     * every lane and received orders for one** — and multi-lane carts are the
     * normal product of the lane model, because `auctionSettlement` pushes a
     * won auction into whatever is already in the cart. A buyer with a won
     * auction plus ordinary items paid for both and got one.
     *
     * With a selection the divergence ran the other way: charged for the
     * selected items, orders for the whole lane.
     *
     * `resolveCheckoutItems` is the single definition both paths now call.
     */
    const activeItems = resolveCheckoutItems(cartItems, cart.selectedItemIds);

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
    /*
     * `minimumTransactionFee` is NOT read here any more — `computeCheckoutFees`
     * owns the floor and returns it as `totalFee` (D41). Leaving a local copy
     * would be the spare part that invites the next hand-rolled derivation.
     */

    // Was hand-rolled arithmetic here, diverging from every other money path
    // the moment any rule changed (as the ₹10 cap just did). One helper now.
    /*
     * `fees` kept whole, not destructured away: `totalFee` is the FLOORED fee
     * and is what the total below must use (D41). Destructuring only
     * `platformFee`/`gstOnFee` is how the floor came to be re-derived by hand
     * here while `totalFee` sat unread.
     */
    const fees = computeCheckoutFees(subtotalRs, commissionRates);
    const { platformFee, gstOnFee } = fees;

    // Shipping is charged per resulting order (one per seller-group the cart
    // splits into at order-creation time), same as createPhonePeGroupOrder /
    // createOrderForGroup — reuses the same resolveShippingCost the order
    // that gets placed after payment actually charges/records, so the amount
    // captured here can't fall short of what's later recorded as owed.
    const orderGroups = splitCartIntoOrderGroups(activeItems.map((item) => ({ item })));
    /*
     * 🛑 D44 — `goodsValue` must be passed HERE, and it moves together with the
     * order paths and the post-capture guard.
     *
     * `resolveShippingCost` quoted with `goodsValue: 0`, so a store's
     * free-above-threshold could never fire (`0 >= 999` is false) and this
     * route CHARGED the base rate on an order that qualified for free
     * shipping. The buyer was overcharged, and the seller's own published
     * offer silently did not exist.
     *
     * `lineTotalFor`, not `item.price * item.quantity` — the hand-rolled rule
     * Root Cause #75 is about, which differs on a locked-price or grouped line.
     */
    const shippingFeesByGroup = await Promise.all(
      orderGroups.map((group) =>
        resolveShippingCost(group.items[0].item.storeId, {
          goodsValue: group.items.reduce(
            (sum, { item }) => sum + lineTotalFor(item, productById.get(item.productId) ?? null),
            0,
          ),
        }),
      ),
    );
    const shippingFee = shippingFeesByGroup.reduce((sum, r) => sum + r.shippingFee, 0);

    // Add-ons are per store, read off the cart doc — this route used to charge
    // each add-on ONCE for the whole cart while the orders it later produced
    // charged per store, so the gateway collected less than the orders recorded.
    /*
     * 🛑 A per-group ARRAY, summed below, where this was a `reduce` to one
     * figure. The points tender needs each group's own base — including its
     * add-ons — and re-deriving them in a second loop would be a copy of the
     * three-tier protection gate, which is the one piece of this route that
     * has already drifted from the order path once (C0c defect 1, on this
     * exact axis). The sum is unchanged, so the captured amount is unchanged.
     */
    const addonFeesByGroup = orderGroups.map((group, groupIndex) => {
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
        computeGiftWrapFee(addons.giftWrapAddon ?? false, commissionRates) +
        shippingProtectionFee +
        saleProtectionFee
      );
    });
    const addonFees = addonFeesByGroup.reduce((sum, fee) => sum + fee, 0);

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
    /*
     * ── D37: THE COUPON DISCOUNT. This route had no coupon term at all. ─────
     *
     * 🛑 Measured before the fix: zero occurrences of "coupon" or "discount"
     * anywhere in this file, while all three sibling money paths compute
     * `max(0, total − couponDiscount) + …`:
     *
     *   createOrderForGroup       (COD / UPI / cash / EMI)   actions.ts:1098
     *   previewCheckoutPricing    (what the buyer is SHOWN)  actions.ts:2214
     *   createRazorpayGroupOrder  (what the order RECORDS)   actions.ts:2563
     *
     * So a buyer with a coupon saw ₹X−discount in the preview, had ₹X taken
     * from their card by this route, and ended up with an order recording
     * ₹X−discount. A live overcharge, on real cards, for the full value of
     * every coupon redeemed online.
     *
     * It survived because the post-capture guard is ONE-SIDED
     * (`paidAmountRs < expected − 1`), so an over-capture never trips it.
     * Every figure inside our own system agreed with every other; only the
     * buyer's card statement disagreed, which is why there is nothing in our
     * data to have noticed.
     *
     * Computed PER GROUP and summed, never against the cart-wide subtotal — a
     * seller-scoped coupon applies to one store's items only, and the
     * per-group `min(discount, groupTotal)` clamp has to bind per group. On a
     * single-seller cart the two agree; on a multi-seller cart they diverge.
     * `computeCartCouponDiscount` is the shared helper the other three paths
     * now also resolve to, so a fourth divergence is not expressible.
     */
    const { couponDiscount } = computeCartCouponDiscount(
      cart.appliedCoupons ?? [],
      orderGroups.map((group) => ({
        storeId: group.items[0].item.storeId,
        lines: group.items.map(({ item }) => ({
          itemId: item.itemId,
          lineTotal: lineTotalFor(item, productById.get(item.productId) ?? null),
        })),
      })),
    );

    /*
     * Discount applies to the GOODS, before fees — matching the order path's
     * `max(0, groupTotal − couponDiscount) + shipping + fees`. Clamped at zero
     * so a discount larger than the goods cannot make fees negative.
     *
     * 🛑 The `minimumTransactionFee` floor below must be computed on the
     * DISCOUNTED goods too, or a coupon could push the total under the floor
     * and the floor would silently restore the discount.
     */
    const discountedSubtotal = Math.max(0, subtotalRs - couponDiscount);
    /*
     * 🛑 D41 — `totalFee` IS the floored fee, and using it here retires a
     * hand-rolled copy of the rule.
     *
     * This was `Math.max(rawTotal, discountedSubtotal + minimumTransactionFee +
     * addonFees + shippingFee)` — a second derivation of
     * `max(platformFee + gstOnFee, minimumTransactionFee)`, which is precisely
     * what `computeCheckoutFees().totalFee` already returns. And `totalFee` had
     * **zero consumers**, so the floor lived in a field nothing read while
     * being re-implemented here.
     *
     * Worse than duplication: `allocateCheckoutFees` apportioned the UNFLOORED
     * fee to each order group, so where the floor bit, the gateway captured the
     * floored amount and the orders recorded less than was collected. The
     * allocator now applies the floor (see its 🛑), which makes this expression
     * and the orders agree by construction rather than by two people keeping
     * the same arithmetic in their heads (Root Cause #75).
     */
    /*
     * ── S5a: the shared-purchase fee, ON THE CAPTURED AMOUNT ─────────────────
     *
     * 🛑 This route is the fourth money path and the one D37 proves gets left
     * behind: the coupon discount reached the preview, both order paths and the
     * guard, and NOT this file — so the buyer was shown one figure, charged
     * another, and the order recorded the first. Points moved here in the same
     * commit for that reason, and so does this.
     *
     * 🛑 And on THIS path a mismatch is worse than an overcharge. The orders
     * are created AFTER capture, so if the order path adds a term this route
     * does not, `createPhonePeGroupOrder` records a total above what was
     * collected — and the post-capture guard then rejects a correctly-charged
     * payment, which is a charged-with-no-order (the D64 class).
     *
     * Per group, through the same `quoteSharedPurchase` and the same
     * `countDestinations`, reading the rates off the per-group store resolution
     * that `shippingFeesByGroup` already performed — no extra read.
     */
    const sharedPurchaseFee = orderGroups.reduce((sum, group, i) => {
      const quote = quoteSharedPurchase({
        destinationCount: countDestinations(group.items.map(({ item }) => item)),
        rates: shippingFeesByGroup[i]?.sharedPurchaseRates ?? {},
      });
      /*
       * An unpriced arrangement is refused by the ORDER path, which runs
       * after this one. Capturing ₹0 for it here and failing there would take
       * the money and then refuse the order, so it is refused BEFORE the
       * gateway is asked for anything.
       */
      if (quote.unpriced) {
        throw ApiErrors.badRequest(
          "This seller has not set a price for splitting an order across addresses. " +
            "Send everything to one address, or contact the seller.",
        );
      }
      return sum + quote.total;
    }, 0);

    /*
     * ── 0f — THE INSTALMENT TERMS, ON THE AMOUNT ACTUALLY CAPTURED ───────────
     *
     * 🛑 This is the D37 line again, one feature over. EMI used to be a
     * `paymentMethod`, so this route — reached only by the ONLINE tender —
     * could never see an instalment order and had no term for one. Separating
     * the opt-in from the tender makes "pay the token online" reachable, and
     * without these two terms the gateway would capture the FULL total of an
     * order whose own document records a token plus a schedule.
     *
     * Two terms, opposite signs, both required:
     *   + surcharge — the cost of credit, genuinely added to the total
     *   − deferred  — principal + surcharge moved into the instalments
     *
     * 🛑 Per group, through the SAME `groupEmiQuote` the order writer and the
     * post-capture guard call, because `emi.minOrderValue` and the seller's own
     * opt-in are both per-seller: a cart spanning an eligible and an
     * ineligible store defers only the eligible one's balance, and a cart-wide
     * figure would capture an amount neither order could record.
     *
     * 🛑 `computeBuyerEmiQuote` beneath it, never `computeEmiSchedule` — this
     * is a route, and the platform/seller surcharge split has no business in
     * anything a browser can reach (Root Cause #70).
     */
    const emiTenureMonths = cart.emiPlan?.tenureMonths;
    const emiQuotesByGroup = orderGroups.map((group, i) =>
      groupEmiQuote(
        {
          emiOptIn: emiTenureMonths !== undefined,
          emiTenureMonths,
          groupSubtotal: group.items.reduce(
            (gs, { item }) => gs + lineTotalFor(item, productById.get(item.productId) ?? null),
            0,
          ),
          sellerEmiEnabled: shippingFeesByGroup[i]?.storeEmiEnabled === true,
        },
        siteSettings?.emi,
      ),
    );
    const emiSurcharge = emiQuotesByGroup.reduce((sum, q) => sum + (q?.surchargeAmount ?? 0), 0);
    const emiDeferred = emiQuotesByGroup.reduce((sum, q) => sum + (q?.remainingBalance ?? 0), 0);

    const totalAmount =
      discountedSubtotal + fees.totalFee + addonFees + shippingFee + sharedPurchaseFee + emiSurcharge - emiDeferred;

    /*
     * ── D46/D47 — THE POINTS TENDER, ON THE AMOUNT ACTUALLY CAPTURED ─────────
     *
     * 🛑 This is the line D37 is about. The coupon discount reached the preview,
     * both order paths and the guard, and NOT this route — so the buyer was
     * shown one figure, charged another, and the order recorded the first. The
     * overcharge was invisible in our own data because the guard was one-sided.
     * Points are the same shape of change, so the capture figure moves in the
     * same commit as everything else.
     *
     * 🛑 Per group through the SHARED allocator, never a cart-wide `min`. With
     * one accepting store and one declining store, a cart-wide application
     * would capture a discount the orders cannot record — the declining
     * seller's order would owe more than was collected.
     *
     * The bases are rebuilt here from the same terms in the same order the
     * order path uses, including each group's share of the capped commission,
     * because this route deliberately computes its own total rather than
     * calling the preview.
     */
    const useAllPoints = cart.useAllPoints === true;
    let pointsApplied = 0;
    if (useAllPoints) {
      const balance = await pointsRepository.getBalance(user!.uid).catch((err: unknown) => {
        // Fails to ZERO: no discount, full capture, points untouched. The
        // inverse would capture less than the orders record as owed.
        serverLogger.warn("[create-order] points balance unreadable — capturing full amount", {
          error: normalizeError(err).message,
        });
        return 0;
      });
      if (balance > 0) {
        const groupSubtotals = orderGroups.map(
          (group) =>
            [
              group.items[0].item.storeId,
              group.items.reduce(
                (gs, { item }) =>
                  gs + lineTotalFor(item, productById.get(item.productId) ?? null),
                0,
              ),
            ] as const,
        );
        const feeByGroup = allocateCheckoutFees(groupSubtotals, fees);
        const couponByGroup = computeCartCouponDiscount(
          cart.appliedCoupons ?? [],
          orderGroups.map((group) => ({
            storeId: group.items[0].item.storeId,
            lines: group.items.map(({ item }) => ({
              itemId: item.itemId,
              lineTotal: lineTotalFor(item, productById.get(item.productId) ?? null),
            })),
          })),
        ).perGroup;
        /*
         * One expression, no block body — deliberately. The three `const`s
         * this replaces sat at brace-depth 6 inside `if → if → callback`,
         * which `audit-code-quality`'s DEEP_NESTING rule blocks, and the
         * arithmetic they fed now lives in `pointsBaseForGroup` where both
         * money paths share it. The repeated `feeByGroup.get` is a Map lookup.
         */
        const bases = orderGroups.map((group, i) =>
          pointsBaseForGroup({
            goods: groupSubtotals[i][1],
            couponDiscount: couponByGroup[i]?.couponDiscount ?? 0,
            shippingFee: shippingFeesByGroup[i]?.shippingFee ?? 0,
            addonFee: addonFeesByGroup[i],
            platformFee: feeByGroup.get(group.items[0].item.storeId)?.platformFee ?? 0,
            gstOnFee: feeByGroup.get(group.items[0].item.storeId)?.gstOnFee ?? 0,
            acceptsPoints: shippingFeesByGroup[i]?.acceptsPoints === true,
          }),
        );
        pointsApplied = allocatePointsAcrossGroups(bases, balance, true).pointsApplied;
      }
    }

    /*
     * 🛑 `amountDue`, not `totalAmount`. The gateway captures what the buyer
     * owes after their points; the orders created later record the same figure
     * in `amountDue` and the post-capture guard compares against it.
     */
    const amountDue = roundRupees(Math.max(0, totalAmount - pointsApplied));

    const amountInPaise = rupeesToPaise(amountDue);

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
      /*
       * Packed so the webhook can place the order without a session. Both are
       * re-validated at settle time — `addressId` against the buyer's own
       * ownership, `outOfStockPolicy` against its enum — so a tampered note
       * cannot widen anything; it can only fail the same checks the
       * buyer-present path already applies.
       */
      ...(addressId ? { addressId } : {}),
      outOfStockPolicy,
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
