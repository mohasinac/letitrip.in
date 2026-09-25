import { withPhonePeEnabled } from "@/lib/payment-gate";
import { withProviders } from "@/providers.config";
import { z } from "zod";
import { successResponse } from "@mohasinac/appkit";
import { createRouteHandler } from "@mohasinac/appkit";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit";
import { verifyAndPlacePhonePeOrderAction } from "@mohasinac/appkit";

/**
 * Payment Verify Route
 *
 * POST /api/payment/verify
 *
 * Thin delegator over appkit's `verifyAndPlacePhonePeOrderAction`. The
 * action confirms the payment via PhonePe's Order Status API (there is no
 * client-side signature to check — PhonePe never hands the browser a
 * verifiable proof of payment), cross-checks the amount, decrements stock,
 * clears the cart, creates one or more orders, and sends notifications +
 * email + RTDB signal.
 *
 * The same action is also called from the webhook route for the case where
 * the buyer closes the tab before this call ever happens — an idempotency
 * claim inside the action ensures only one of the two places an order.
 */

const verifySchema = z.object({
  merchantOrderId: z.string().min(1),
  addressId: z.string().min(1),
  notes: z.string().max(500).optional(),
  /**
   * Buyer's choice for what to do when a cart item is unavailable at
   * checkout time. Defaults to "cancel_order" (not "skip_items") — matches
   * this path's historical (only) behavior for any old client that omits
   * the field.
   */
  outOfStockPolicy: z.enum(["cancel_order", "skip_items"]).default("cancel_order"),
  // Add-ons are NOT accepted here. Both paths read `CartDocument.storeAddons`,
  // per store, so there is no client-supplied value left to keep in sync.
});

const __POST__g = withProviders(createRouteHandler<(typeof verifySchema)["_output"]>({
  auth: true,
  schema: verifySchema,
  handler: async ({ user, body }) => {
    const { merchantOrderId, addressId, notes, outOfStockPolicy } = body!;
    const result = await verifyAndPlacePhonePeOrderAction({
      merchantOrderId,
      userId: user!.uid,
      userName:
        (user!["displayName"] as string | null | undefined) ??
        user!.email ??
        "Unknown User",
      userEmail: user!.email ?? "",
      addressId,
      notes,
      outOfStockPolicy,
    });
    return successResponse(result, SUCCESS_MESSAGES.CHECKOUT.PAYMENT_RECEIVED);
  },
}));

export const POST = withPhonePeEnabled(__POST__g);
