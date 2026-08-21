import { withProviders } from "@/providers.config";
import { z } from "zod";
import { successResponse } from "@mohasinac/appkit";
import { createRouteHandler } from "@mohasinac/appkit";
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
  // Add-on booleans are NOT accepted: they live per store on the cart document
  // (`CartDocument.storeAddons`), which is the granularity they are billed at.
});

export const POST = withProviders(createRouteHandler<(typeof pricingPreviewSchema)["_output"]>({
  auth: true,
  schema: pricingPreviewSchema,
  handler: async ({ user, body }) => {
    const { addressId, paymentMethod, excludedProductIds, lane } = body!;
    const preview = await previewCheckoutPricing({
      userId: user!.uid,
      addressId,
      paymentMethod,
      excludedProductIds,
      lane,
    });
    return successResponse(preview);
  },
}));
