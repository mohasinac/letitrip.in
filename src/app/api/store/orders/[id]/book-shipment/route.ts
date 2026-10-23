/**
 * `POST /api/store/orders/[id]/book-shipment` — book this parcel through the
 * platform's carrier account.
 *
 * 🛑 It ENQUEUES; it does not book. A carrier call is an outbound request on
 * a 10s sync-function ceiling (Rule #6), and a timeout there is the worst
 * available outcome — the carrier may have accepted, so retrying
 * double-books and not retrying leaves a parcel nobody collects. The job
 * runner does the work and `useBulkEvent` reports it.
 *
 * 🛑 This is 0e's missing half. `shipOrderSchema` carries
 * `method: z.literal("custom")` with a comment saying manual is the only
 * provider — no longer true — so a seller has never been able to EXPRESS
 * "book this through us". The form must not offer the option until this
 * exists, or it is a button the server refuses.
 */

import { withProviders } from "@/providers.config";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { enqueueJob } from "@mohasinac/appkit/features/jobs/actions/enqueue-job";
import { ROLES_STORE_WRITE } from "@/constants/api-roles";
import { z } from "zod";

const bodySchema = z.object({
  pickupAddressId: z.string().min(1).max(200),
  /*
   * From the dispatch form's box preset. Bounded because a carrier rejects
   * absurd dimensions with an opaque error, and a 400 here names the field.
   */
  dimensions: z.object({
    weight: z.number().positive().max(50),
    length: z.number().positive().max(200),
    width: z.number().positive().max(200),
    height: z.number().positive().max(200),
  }),
});

export const POST = withProviders(
  createRouteHandler<z.infer<typeof bodySchema>>({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    schema: bodySchema,
    handler: async ({ user, params, body }) => {
      /*
       * Ownership is enforced inside `bookShipment`, which resolves the
       * pickup address against the ORDER'S STORE — so a seller cannot book
       * another seller's parcel, and cannot have it collected from their own
       * premises either.
       */
      const { jobId, customToken } = await enqueueJob({
        jobType: "bookShipment",
        payload: {
          orderId: (params as { id: string }).id,
          pickupAddressId: body!.pickupAddressId,
          dimensions: body!.dimensions,
        },
        requestedBy: user!.uid,
      });
      return successResponse({ jobId, customToken }, "Booking the parcel…");
    },
  }),
);
