import { withProviders } from "@/providers.config";
import { z } from "zod";
import { userRepository } from "@mohasinac/appkit/features/auth/repository/user.repository";
import { enterEvent } from "@mohasinac/appkit/features/events/actions/event-actions";
import { errorResponse, successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { applyRateLimit, isSoftBanned, RateLimitPresets } from "@mohasinac/appkit/server";

/*
 * `EnterEventInput`'s three fields, as a schema rather than as an interface the
 * route asserted by passing an unparsed body straight through.
 *
 * This endpoint is `authOptional`, so it is the most open write path in the
 * app — a guest can reach it on any active event with guest participation on.
 * `parseJsonBody` proves only that the payload is JSON; the previous code then
 * handed that JSON to `enterEvent` as an `EnterEventInput`, so `pollVotes`
 * could be a string, an object, or a 10,000-element array, and the entry
 * document was written from it.
 *
 * The bounds are the ones the write actually needs: an eventEntry is one
 * Firestore document, and `formResponses` is stored whole.
 */
const enterEventSchema = z.object({
  pollVotes: z.array(z.string().trim().min(1).max(200)).max(50).optional(),
  pollComment: z.string().trim().max(2000).optional(),
  /*
   * A survey/feedback form is admin-authored, so its keys cannot be enumerated
   * here. `z.record` still does the load-bearing part — it proves the value is
   * an OBJECT of primitives rather than an arbitrarily nested structure, and
   * caps how many answers one entry may carry.
   */
  formResponses: z
    .record(z.string().max(120), z.union([z.string().max(4000), z.number(), z.boolean(), z.null()]))
    .refine((r) => Object.keys(r).length <= 100, "Too many form responses")
    .optional(),
});

const __POST__g = withProviders(
  createRouteHandler<(typeof enterEventSchema)["_output"]>({
    authOptional: true,
    schema: enterEventSchema,
    handler: async ({ user, request, body, params }) => {
      const rl = await applyRateLimit(request, RateLimitPresets.GENEROUS);
      if (!rl.success) return errorResponse("Too many requests", 429);

      if (user) {
        const userDoc = await userRepository.findById(user.uid);
        if (userDoc && isSoftBanned(userDoc, "join_events")) {
          const ban = userDoc.softBans?.find((b) => b.action === "join_events");
          return errorResponse(
            `Your account is restricted from joining events. Reason: ${ban?.reason ?? "Policy violation"}. Contact support if you believe this is an error.`,
            403,
          );
        }
      }
      const eventId = (params as { id: string }).id;
      const safeUser = user
        ? { uid: user.uid, displayName: user.displayName, email: user.email ?? undefined }
        : undefined;
      const result = await enterEvent(eventId, body!, safeUser, request);
      return successResponse(result, "Entry submitted", 201);
    },
  }),
);

export const POST = __POST__g;
