/**
 * D56 — approve or reject an ad creative.
 *
 * POST { approve, note? }
 *
 * 🛑 This is the ONLY writer of `moderation.state`, and the advertiser's own
 * write schema cannot name the field at all (`.strict()`). A self-serve
 * surface where the submitter can set their own moderation state is not
 * moderated — it is a form with an extra field.
 *
 * 🛑 A rejection REQUIRES a note of at least 10 characters, enforced by the
 * schema here AND again in `moderateAdCreative` so a non-route caller cannot
 * skip it. Without one the advertiser resubmits the same creative and the
 * moderator reviews it twice — the admin offer-cancel learned this already.
 */
import { withProviders } from "@/providers.config";

import { ROLES_ADMIN_MOD } from "@/constants/api-roles";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { moderateAdCreative } from "@mohasinac/appkit/server";
import { adModerationSchema } from "@mohasinac/appkit/features/ads/schemas/booking-write";

const __POST__g = withProviders(
  createRouteHandler<(typeof adModerationSchema)["_output"]>({
    auth: true,
    roles: ROLES_ADMIN_MOD,
    permission: "settings:write",
    schema: adModerationSchema,
    handler: async ({ user, body, params }) => {
      const id = String((params as { id?: string })?.id ?? "");
      await moderateAdCreative(id, {
        approve: body!.approve,
        ...(body!.note ? { note: body!.note } : {}),
        reviewerUid: user!.uid,
      });
      return successResponse(
        { bookingId: id, state: body!.approve ? "approved" : "rejected" },
        body!.approve ? "Creative approved." : "Creative rejected.",
      );
    },
  }),
);
export const POST = __POST__g;
