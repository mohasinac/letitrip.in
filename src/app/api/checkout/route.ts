import { withProviders } from "@/providers.config";
import { z } from "zod";
import { successResponse } from "@mohasinac/appkit";
import { createRouteHandler } from "@mohasinac/appkit";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit";
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
  paymentMethod: z.enum(["cod", "online", "upi_manual", "emi"]).default("cod"),
  /** Required when paymentMethod === "emi" — validated further by createCheckoutOrderAction. */
  emiTenureMonths: z.number().int().min(2).max(6).optional(),
  notes: z.string().max(500).optional(),
  excludedProductIds: z.array(z.string()).optional(),
  /** Buyer's choice for what to do when a cart item is unavailable at checkout time. */
  outOfStockPolicy: z.enum(["cancel_order", "skip_items"]).default("skip_items"),
  /** Buyer opted into the ₹10 WhatsApp order-updates addon. Unchecked by default. */
  whatsappNotifyAddon: z.boolean().optional().default(false),
  /** Buyer opted into gift wrap. Unchecked by default. */
  giftWrapAddon: z.boolean().optional().default(false),
  giftWrapMessage: z.string().max(500).optional(),
  /** Buyer opted into shipment protection. Unchecked by default. */
  shipmentProtectionAddon: z.boolean().optional().default(false),
});

export const POST = withProviders(createRouteHandler<(typeof checkoutSchema)["_output"]>({
  auth: true,
  schema: checkoutSchema,
  handler: async ({ user, body }) => {
    const { addressId, paymentMethod, emiTenureMonths, notes, excludedProductIds, outOfStockPolicy, whatsappNotifyAddon, giftWrapAddon, giftWrapMessage, shipmentProtectionAddon } = body!;
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
      notes,
      excludedProductIds,
      outOfStockPolicy,
      whatsappNotifyAddon,
      giftWrapAddon,
      giftWrapMessage,
      shipmentProtectionAddon,
    });
    return successResponse(result, SUCCESS_MESSAGES.CHECKOUT.ORDER_PLACED);
  },
}));