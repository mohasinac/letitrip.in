import { withFeatureGuard } from "@/lib/features";
import { withProviders } from "@/providers.config";
import { z } from "zod";
import { successResponse } from "@mohasinac/appkit";
import { createRouteHandler } from "@mohasinac/appkit";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit";
import { verifyAndPlaceRazorpayOrderAction } from "@mohasinac/appkit";

/**
 * Payment Verify Route
 *
 * POST /api/payment/verify
 *
 * Thin delegator over appkit's `verifyAndPlaceRazorpayOrderAction`. The
 * action does signature verification, amount cross-check, stock decrement,
 * cart clear, multi-order create, notifications, email + RTDB signal.
 */

const verifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  addressId: z.string().min(1),
  notes: z.string().max(500).optional(),
  /**
   * Buyer's choice for what to do when a cart item is unavailable at
   * checkout time. Defaults to "cancel_order" (not "skip_items") — matches
   * this path's historical (only) behavior for any old client that omits
   * the field.
   */
  outOfStockPolicy: z.enum(["cancel_order", "skip_items"]).default("cancel_order"),
  // Add-ons are NOT accepted here. The doc comments used to say each one "must
  // match the value sent to /api/payment/create-order" — that contract is gone:
  // both paths now read `CartDocument.storeAddons`, per store, so there is no
  // client-supplied value left to keep in sync (Root Cause #65).
});

const __POST__g = withProviders(createRouteHandler<(typeof verifySchema)["_output"]>({
  auth: true,
  schema: verifySchema,
  handler: async ({ user, body }) => {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      addressId,
      notes,
      outOfStockPolicy,
    } = body!;
    const result = await verifyAndPlaceRazorpayOrderAction({
      userId: user!.uid,
      userName:
        (user!["displayName"] as string | null | undefined) ??
        user!.email ??
        "Unknown User",
      userEmail: user!.email ?? "",
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      addressId,
      notes,
      outOfStockPolicy,
    });
    return successResponse(result, SUCCESS_MESSAGES.CHECKOUT.PAYMENT_RECEIVED);
  },
}));

export const POST = withFeatureGuard("RAZORPAY", __POST__g);
