import { withProviders } from "@/providers.config";
import { z } from "zod";
import { cancelOrderForUser, cancelOrderItemsForUser } from "@mohasinac/appkit/features/orders/actions/order-actions";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
/*
 * From `/server`, not the bare barrel. `REFUND_COPY` lives in
 * `_internal/shared/` which publishes no subpath, so the only doors are the
 * three entries — and in a route handler the server entry is the one that
 * cannot pull a `"use client"` module into a server graph (Root Cause #76, and
 * the second-appkit-instance 401 of 2026-10-20).
 */
import { REFUND_COPY } from "@mohasinac/appkit/server";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";

const cancelSchema = z.object({
  reason: z.string().min(1).max(500).default("Cancelled by user"),
  itemIds: z.array(z.string().min(1)).optional(),
});

export const POST = withProviders(
  createRouteHandler<(typeof cancelSchema)["_output"]>({
    auth: true,
    schema: cancelSchema,
    handler: async ({ user, body, params }) => {
      const orderId = (params as { id: string }).id;
      if (body!.itemIds?.length) {
        const partial = await cancelOrderItemsForUser(
          user!.uid,
          orderId,
          body!.itemIds,
          body!.reason,
        );
        /*
         * `partial` is non-null only when every remaining item was already
         * cancelled, so this fell through to cancelling the whole order — in
         * which case a refund decision WAS taken and the buyer should be told.
         */
        return successResponse(
          { refund: partial },
          partial ? REFUND_COPY.cancellation.message(partial) : "Selected items cancelled",
        );
      }
      const refund = await cancelOrderForUser(user!.uid, orderId, body!.reason);
      /*
       * 🛑 This returned `successResponse(null, "Order cancelled")` — true, and
       * silent about the money, on a route that may have just refunded a few
       * thousand rupees or decided it could not (D14). The outcome is in the
       * body AND in the message, because a buyer reads the message.
       */
      return successResponse({ refund }, REFUND_COPY.cancellation.message(refund));
    },
  }),
);