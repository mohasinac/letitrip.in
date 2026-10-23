/**
 * `POST /api/user/orders/[id]/delivery-address` — the buyer corrects where
 * their parcel goes.
 *
 * 🛑 It APPENDS an amendment; it never rewrites the snapshot. The snapshot is
 * what the invoice states and what a dispute argues over, and a correction is
 * a new fact about delivery rather than a revision of what was agreed.
 *
 * 🛑 The body carries an `addressId`, never an address. A free-form address
 * would let a correction route a parcel anywhere with no record the
 * destination was ever the buyer's — the hole `assertOwnedAddresses` closes
 * for coordinated purchases. `amendDeliveryAddress` resolves it against the
 * ORDER'S BUYER, so a support agent acting on someone's behalf still picks
 * from that buyer's own addresses.
 */

import { withProviders } from "@/providers.config";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { amendDeliveryAddress } from "@mohasinac/appkit/server";
import { z } from "zod";

const bodySchema = z.object({
  addressId: z.string().min(1).max(200),
  reason: z.string().trim().max(300).optional(),
});

export const POST = withProviders(
  createRouteHandler<z.infer<typeof bodySchema>>({
    auth: true,
    /*
     * 🛑 No `roles` and no `permission`, matching the sibling buyer-order
     * routes (`cancel`, `completion`): ownership is the gate, and it is
     * enforced inside `amendDeliveryAddress`, which answers 404 — not 403 —
     * when the order is not the caller's, so the endpoint never confirms that
     * an order id exists.
     *
     * The first draft wrote `permission: "orders:update-own"`, a string that
     * exists NOWHERE in this codebase. An unknown permission is not a
     * tightening; it is a chip id that matches no stored value (Root Cause
     * #33) — it either fails every caller or is ignored, and neither is what
     * the author meant.
     */
    schema: bodySchema,
    handler: async ({ user, params, body }) => {
      const amendment = await amendDeliveryAddress(
        {
          orderId: (params as { id: string }).id,
          addressId: body!.addressId,
          ...(body!.reason ? { reason: body!.reason } : {}),
        },
        { uid: user!.uid, role: "buyer" },
      );
      /*
       * The amendment is returned PLAINTEXT, which is correct here and only
       * here: it is the buyer's own address, being echoed to the buyer who
       * just chose it.
       */
      return successResponse(amendment, "Delivery address updated.");
    },
  }),
);
