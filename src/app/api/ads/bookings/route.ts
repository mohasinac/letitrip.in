/**
 * D56 — the advertiser's own bookings.
 *
 * POST — take a slot. GET — list mine.
 *
 * 🛑 No try/catch. `createRouteHandler` already maps a thrown
 * `ValidationError` to a 400 carrying its field issues, `NotFoundError` to
 * 404 and `ConflictError` to 409 — and the 409 is the one that matters here,
 * because "that slot is already booked" is a well-formed request against a
 * world that moved, not a form the advertiser filled in wrongly. Catching
 * would flatten all three into one untyped 400.
 *
 * 🛑 `auth: true` with NO `roles`. Advertising is open to any signed-in
 * account by design — that is what "self-serve" means, and gating it behind
 * a role would make it the admin-only feature the plan explicitly chose
 * against. Ownership is enforced per-booking inside the actions.
 */
import { withProviders } from "@/providers.config";

import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { bookAdSlot, adBookingsForAdvertiser } from "@mohasinac/appkit/server";
import { adBookingWriteSchema } from "@mohasinac/appkit/features/ads/schemas/booking-write";

const __POST__g = withProviders(
  createRouteHandler<(typeof adBookingWriteSchema)["_output"]>({
    auth: true,
    schema: adBookingWriteSchema,
    handler: async ({ user, body }) => {
      const id = await bookAdSlot({
        placementId: body!.placementId,
        period: body!.period,
        advertiserUid: user!.uid,
        ...(user!.name ? { advertiserName: user!.name } : {}),
        creative: body!.creative,
      });
      return successResponse({ bookingId: id }, "Slot booked — your creative is awaiting review.");
    },
  }),
);
export const POST = __POST__g;

const __GET__g = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user }) => {
      const bookings = await adBookingsForAdvertiser(user!.uid);
      return successResponse({ bookings });
    },
  }),
);
export const GET = __GET__g;
