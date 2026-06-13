import { withProviders } from "@/providers.config";
import { z } from "zod";
import { successResponse } from "@mohasinac/appkit";
import { createRouteHandler } from "@mohasinac/appkit";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit";
import { createCheckoutOrderAction } from "@mohasinac/appkit";

/**
 * Checkout API
 *
 * POST /api/checkout — Place order(s) from the user's cart (COD / UPI-manual path)
 *
 * Razorpay-paid orders go through `/api/payment/create-order` →
 * `/api/payment/verify` instead. Both routes are thin delegators over
 * appkit's `_internal/server/features/checkout/actions.ts`.
 */

const checkoutSchema = z.object({
  addressId: z.string().min(1, "addressId is required"),
  paymentMethod: z.enum(["cod", "online", "upi_manual"]).default("cod"),
  notes: z.string().max(500).optional(),
  excludedProductIds: z.array(z.string()).optional(),
});

// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export const POST = withProviders(createRouteHandler<(typeof checkoutSchema)["_output"]>({
  auth: true,
  schema: checkoutSchema,
  handler: async ({ user, body }) => {
    const { addressId, paymentMethod, notes, excludedProductIds } = body!;
    const result = await createCheckoutOrderAction({
      userId: user!.uid,
      userName:
        (user!["displayName"] as string | null | undefined) ??
        user!.email ??
        "Unknown User",
      userEmail: user!.email ?? "",
      addressId,
      paymentMethod,
      notes,
      excludedProductIds,
    });
    return successResponse(result, SUCCESS_MESSAGES.CHECKOUT.ORDER_PLACED);
  },
}));
