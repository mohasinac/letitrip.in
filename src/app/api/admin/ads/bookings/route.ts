/**
 * D56 — the moderation queue.
 *
 * GET — every booking awaiting review, oldest first.
 *
 * 🛑 `advertiserName` is read off the booking, not resolved from `users`.
 * A queue that fans out one user read per row is the per-request scan
 * pattern Rule #6 exists to prevent, and the name is denormalised onto the
 * booking at creation for exactly this reader.
 */
import { withProviders } from "@/providers.config";

import { ROLES_ADMIN_MOD } from "@/constants/api-roles";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { pendingAdBookings } from "@mohasinac/appkit/server";

const __GET__g = withProviders(
  createRouteHandler({
    auth: true,
    roles: ROLES_ADMIN_MOD,
    permission: "settings:write",
    handler: async () => {
      const bookings = await pendingAdBookings();
      return successResponse({ bookings });
    },
  }),
);
export const GET = __GET__g;
