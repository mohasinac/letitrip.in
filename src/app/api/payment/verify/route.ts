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
  platformFee: z.number().nonnegative().optional(),
});

export const POST = withProviders(createRouteHandler<(typeof verifySchema)["_output"]>({
  auth: true,
  schema: verifySchema,
  handler: async ({ user, body }) => {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      addressId,
      notes,
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
    });
    return successResponse(result, SUCCESS_MESSAGES.CHECKOUT.PAYMENT_RECEIVED);
  },
}));
