import { withProviders } from "@/providers.config";
import { z } from "zod";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/values/success-messages";
import { createCheckoutOrderAction } from "@mohasinac/appkit";

/**
 * Checkout API
 *
 * POST /api/checkout â€” Place order(s) from the user's cart (COD / UPI-manual path)
 *
 * Razorpay-paid orders go through `/api/payment/create-order` â†’
 * `/api/payment/verify` instead. Both routes are thin delegators over
 * appkit's `_internal/server/features/checkout/actions.ts`.
 */

const checkoutSchema = z.object({
  addressId: z.string().min(1, "addressId is required"),
  /**
   * The TENDER. `"emi"` is still accepted because a tab opened before
   * 2026-10-22 posts it, and `resolveEmiChoice` maps it to
   * `{ emiOptIn: true, paymentMethod: "upi_manual" }` — which is exactly what
   * that request already did. New clients send a real tender plus `emiOptIn`.
   */
  paymentMethod: z.enum(["cod", "online", "upi_manual", "cash", "emi"]).default("cod"),
  /**
   * LEGACY ONLY. The instalment plan lives on the CART
   * (`CartDocument.emiPlan`, written by `PUT /api/cart/emi`) because the
   * online path needs it across two requests. Still accepted so a tab opened
   * before 2026-10-22 is not 400'd mid-payment; ignored when the cart has a plan.
   */
  emiTenureMonths: z.number().int().min(2).max(6).optional(),
  /**
   * The courier the buyer picked, as quoted by POST /api/shipping/quote.
   *
   * 🛑 `.strict()` on the object so a client cannot smuggle extra members into
   * something that is written verbatim onto the order. `chargedRate` is
   * re-rounded server-side before it is billed, which bounds a tampered value
   * to "a carrier rate, correctly rounded" rather than an arbitrary number.
   */
  selectedShippingQuote: z
    .object({
      courierId: z.string().min(1).max(120),
      courierName: z.string().min(1).max(120),
      rawRate: z.number().nonnegative().max(100000),
      chargedRate: z.number().nonnegative().max(100000),
      estimatedDays: z.number().int().min(0).max(90),
    })
    .strict()
    .optional(),
  notes: z.string().max(500).optional(),
  excludedProductIds: z.array(z.string()).optional(),
  /** Buyer's choice for what to do when a cart item is unavailable at checkout time. */
  outOfStockPolicy: z.enum(["cancel_order", "skip_items"]).default("skip_items"),
  // Add-on selections deliberately do NOT live in this body. They are per-store
  // and read from `CartDocument.storeAddons` (written by PUT /api/cart/addons) —
  // the same key the cart is split on, which is the granularity they are billed
  // at. Accepting them here as well would be a second source of truth for one
  // charge, which is exactly the drift Root Cause #65 removed.
});

export const POST = withProviders(createRouteHandler<(typeof checkoutSchema)["_output"]>({
  auth: true,
  schema: checkoutSchema,
  handler: async ({ user, body }) => {
    const { addressId, paymentMethod, emiTenureMonths, notes, excludedProductIds, outOfStockPolicy, selectedShippingQuote } = body!;
    const result = await createCheckoutOrderAction({
      userId: user!.uid,
      userName:
        (user!["displayName"] as string | null | undefined) ??
        user!.email ??
        "Unknown User",
      userEmail: user!.email ?? "",
      addressId,
      paymentMethod,
      emiTenureMonths,
      /*
       * `quotedAt` is stamped HERE, server-side, rather than accepted from the
       * client — a buyer-supplied timestamp is unverifiable, and this field
       * exists precisely so a stale quote is recognisable later.
       */
      selectedShippingQuote: selectedShippingQuote
        ? { ...selectedShippingQuote, quotedAt: new Date() }
        : undefined,
      notes,
      excludedProductIds,
      outOfStockPolicy,
    });
    return successResponse(result, SUCCESS_MESSAGES.CHECKOUT.ORDER_PLACED);
  },
}));