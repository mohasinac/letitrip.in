import { withOnlinePaymentEnabled } from "@/lib/payment-gate";
import { withProviders } from "@/providers.config";
import { z } from "zod";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/values/success-messages";
import { verifyAndPlaceGatewayOrderAction } from "@mohasinac/appkit";

/**
 * Payment Verify Route
 *
 * POST /api/payment/verify
 *
 * Thin delegator over appkit's `verifyAndPlaceGatewayOrderAction`, for either
 * online gateway. The action re-fetches the order from the gateway and
 * requires it to be paid — that server-side fetch is the authority, never the
 * client's report — then cross-checks the amount, decrements stock, clears
 * the cart, creates one or more orders, and sends notifications + email +
 * RTDB signal.
 *
 * Razorpay additionally returns a signed callback to the browser; when the
 * three `razorpay_*` fields are present they are verified as well, in
 * addition to the fetch. PhonePe has no such callback — it never hands the
 * browser a verifiable proof of payment — so for it the fetch is the only
 * possible check.
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
  /*
   * Razorpay's client callback. All three travel together or not at all — a
   * partial set is a malformed request, not a PhonePe call, which is why
   * they sit in one optional object rather than three optional strings.
   *
   * 🛑 Optional at the SCHEMA level only. Supplying them is not a way to
   * choose a weaker check: the action verifies the order against the gateway
   * regardless, and an invalid signature here is a hard rejection even when
   * the order did turn out to be paid.
   */
  razorpaySignature: z
    .object({
      razorpay_order_id: z.string().min(1),
      razorpay_payment_id: z.string().min(1),
      razorpay_signature: z.string().min(1),
    })
    .optional(),
  // Add-ons are NOT accepted here. Both paths read `CartDocument.storeAddons`,
  // per store, so there is no client-supplied value left to keep in sync.
});

const __POST__g = withProviders(createRouteHandler<(typeof verifySchema)["_output"]>({
  auth: true,
  schema: verifySchema,
  handler: async ({ user, body }) => {
    const { merchantOrderId, addressId, notes, outOfStockPolicy, razorpaySignature } = body!;
    const result = await verifyAndPlaceGatewayOrderAction({
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
      razorpaySignature,
    });
    return successResponse(result, SUCCESS_MESSAGES.CHECKOUT.PAYMENT_RECEIVED);
  },
}));

export const POST = withOnlinePaymentEnabled(__POST__g);
