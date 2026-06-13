/**
 * POST /api/admin/dev/emit-shipping-event
 *
 * Track H — admin-only endpoint that fires a synthetic Shiprocket tracking
 * event through the MOCK shipping provider's in-process sink. Used by
 * end-to-end tests to drive a shipment through the canonical tracking
 * progression (Pickup Scheduled → Pickup Completed → … → Delivered).
 *
 * Refuses if the resolved shipping provider is the real Shiprocket one.
 *
 * Guard:
 *   - createRouteHandler({ roles: ROLES_ADMIN_ONLY, permission: "settings:write" })
 *   - applyRateLimit(request, RateLimitPresets.API)
 */

import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  applyRateLimit,
  RateLimitPresets,
  serverLogger,
} from "@mohasinac/appkit";
import { getProviders } from "@mohasinac/appkit/contracts/registry";
import { ROLES_ADMIN_ONLY } from "@/constants";

const emitShippingSchema = z.object({
  trackingId: z.string().min(1),
  event: z.enum([
    "Pickup Scheduled",
    "Pickup Completed",
    "In Transit",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
  ]),
});

// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
export const POST = withProviders(
  createRouteHandler<(typeof emitShippingSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "settings:write",
    schema: emitShippingSchema,
    handler: async ({ user, request, body }) => {
      const rl = await applyRateLimit(request, RateLimitPresets.API);
      if (!rl.success) return errorResponse("Too many requests", 429);

      const providers = getProviders();
      const shipping = providers.shipping as
        | (NonNullable<typeof providers.shipping> & {
            name?: string;
            emitTrackingEvent?: (
              trackingId: string,
              event:
                | "Pickup Scheduled"
                | "Pickup Completed"
                | "In Transit"
                | "Out for Delivery"
                | "Delivered"
                | "Cancelled",
            ) => Promise<void>;
          })
        | undefined;

      if (
        !shipping ||
        shipping.name !== "shiprocket-mock" ||
        typeof shipping.emitTrackingEvent !== "function"
      ) {
        return errorResponse(
          "Mock shipping provider is not active. Toggle siteSettings.featureFlags.useMockShipping in admin settings.",
          409,
          { code: "MOCK_PROVIDER_INACTIVE" },
        );
      }

      await shipping.emitTrackingEvent(body!.trackingId, body!.event);

      serverLogger.info("Admin emitted mock shipping event", {
        actorUid: user!.uid,
        trackingId: body!.trackingId,
        event: body!.event,
      });

      return successResponse({ emitted: true, event: body!.event });
    },
  }),
);
