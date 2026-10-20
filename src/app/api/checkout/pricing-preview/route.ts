import { withProviders } from "@/providers.config";
import { z } from "zod";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { previewCheckoutPricing } from "@mohasinac/appkit";

/**
 * Checkout Pricing Preview API
 *
 * POST /api/checkout/pricing-preview — read-only "what will I actually be
 * charged" breakdown for the checkout Order Summary panel. Reuses the same
 * server-side fee math (shipping, COD handling fee, add-ons, GST, coupon
 * proration) that createCheckoutOrderAction / verifyAndPlaceRazorpayOrderAction
 * use when an order is actually placed, so the number shown here can never
 * diverge from what gets charged/recorded. Never mutates stock, cart, or
 * coupon-usage state.
 */

const pricingPreviewSchema = z.object({
  addressId: z.string().optional(),
  paymentMethod: z.enum(["cod", "online", "upi_manual", "cash", "emi"]).default("cod"),
  excludedProductIds: z.array(z.string()).optional(),
  /**
   * Which cart lane to price. The cart page prices whichever tab the buyer has
   * open — including one that is currently gated off — so it must be explicit.
   * Omitted by checkout, which prices the lane that is actually payable.
   */
  lane: z.enum(["standard", "auction", "offer"]).optional(),
  /**
   * Chosen EMI tenure. Required for an EMI preview to match the order the
   * buyer is actually charged for: the surcharge scales with the tenure, so
   * without it the Order Summary understated the total by its full value
   * (360 at 2 months, 1,080 at 6, on the measured 20,000 cart).
   */
  emiTenureMonths: z.number().int().min(2).max(6).optional(),
  // Add-on booleans are NOT accepted: they live per store on the cart document
  // (`CartDocument.storeAddons`), which is the granularity they are billed at.
});

export const POST = withProviders(createRouteHandler<(typeof pricingPreviewSchema)["_output"]>({
  auth: true,
  schema: pricingPreviewSchema,
  handler: async ({ user, body }) => {
    const { addressId, paymentMethod, excludedProductIds, lane, emiTenureMonths } = body!;
    const preview = await previewCheckoutPricing({
      userId: user!.uid,
      addressId,
      paymentMethod,
      emiTenureMonths,
      excludedProductIds,
      lane,
    });
    return successResponse(preview);
  },
}));
