/**
 * D56 — one of the advertiser's own bookings.
 *
 * PATCH — resubmit a creative. DELETE — cancel.
 *
 * 🛑 Resubmitting RESETS moderation to `pending`, inside the same write.
 * Editing an approved creative without that is the whole attack and needs no
 * cleverness: submit something bland, get approved, swap the image. The
 * reset lives in `resubmitAdCreative` rather than here so every caller gets
 * it, not just this route.
 *
 * 🛑 Cancelling does NOT free the slot for re-sale. The advertiser paid for
 * a month that may already be running, and re-selling it mid-flight means
 * two creatives ran in one slot against one invoice. Releasing a period is a
 * separate, admin-only act.
 *
 * A booking belonging to somebody else answers **404, not 403** — a 403
 * confirms the id exists, which on a derived id (`placement__YYYY-MM`) is a
 * free readout of who has booked what.
 */
import { withProviders } from "@/providers.config";

import { z } from "zod";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { resubmitAdCreative, cancelAdBooking } from "@mohasinac/appkit/server";
import { adCreativeResubmitSchema } from "@mohasinac/appkit/features/ads/schemas/booking-write";

/*
 * 🛑 The PUBLISHED schema, not a local rebuild. `z.object({ creative: X })`
 * built here loses the inner type under this zod, so `body!.creative` arrives
 * as `unknown` and cannot be passed to `resubmitAdCreative`. The sibling POST
 * route works precisely because it uses a published schema's own `_output`.
 */

const __PATCH__g = withProviders(
  createRouteHandler<(typeof adCreativeResubmitSchema)["_output"]>({
    auth: true,
    schema: adCreativeResubmitSchema,
    handler: async ({ user, body, params }) => {
      const id = String((params as { id?: string })?.id ?? "");
      await resubmitAdCreative(id, user!.uid, body!.creative);
      return successResponse({ bookingId: id }, "Resubmitted for review.");
    },
  }),
);
export const PATCH = __PATCH__g;

const __DELETE__g = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, params }) => {
      const id = String((params as { id?: string })?.id ?? "");
      await cancelAdBooking(id, { actorUid: user!.uid });
      return successResponse({ bookingId: id }, "Booking cancelled.");
    },
  }),
);
export const DELETE = __DELETE__g;
