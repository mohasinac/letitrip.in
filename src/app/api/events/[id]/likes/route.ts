import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  toggleEventLikeAction,
  getEventLikersAction,
  rateLimitByIdentifier,
  getClientIP,
  RateLimitPresets,
} from "@mohasinac/appkit/server";

/**
 * GET — one page of "who liked this", for the rail's View-all modal.
 *
 * Public: the names and faces here come from the users' own public
 * projection (`displayName`, `photoURL`), which already renders on public
 * profile pages. No session needed to read it.
 */
const __GET__g = withProviders(
  createRouteHandler({
    authOptional: true,
    handler: async ({ params, request }) => {
      const id = (params as { id: string }).id;
      const url = new URL(request.url);
      const offset = Number(url.searchParams.get("offset") ?? 0);
      const limit = Number(url.searchParams.get("limit") ?? 24);

      const result = await getEventLikersAction(
        id,
        Number.isFinite(offset) ? offset : 0,
        Number.isFinite(limit) ? limit : 24,
      );
      if (!result.ok) return errorResponse(result.error, 500);
      return successResponse(result.data, "Likers");
    },
  }),
);

/**
 * POST — toggle the viewer's like.
 *
 * 🛑 `auth: true`, not `authOptional`. A like is attributable by definition —
 * the whole feature is "who liked this" — and the document id IS
 * `{eventId}__{userId}`, so there is no identity to key a guest like on. A
 * guest sees the sign-in modal client-side; this is the server half of the
 * same rule.
 */
const __POST__g = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ params, user, request }) => {
      const id = (params as { id: string }).id;

      /*
       * Namespaced to this route, per the same reasoning as `event:spin:` —
       * `applyRateLimit` keys on the bare client IP with no route namespace,
       * so every STRICT route would drain one shared bucket and liking twice
       * would start refusing someone else's spin.
       *
       * STANDARD rather than STRICT: toggling a like off and on again is
       * ordinary behaviour, and the write is idempotent on the document id,
       * so the limit is here to stop a script rather than to pace a person.
       */
      const rl = await rateLimitByIdentifier(
        `event:like:${user?.uid ?? getClientIP(request)}`,
        RateLimitPresets.STANDARD,
      );
      if (!rl.success) return errorResponse("Too many requests", 429);

      const result = await toggleEventLikeAction(id, user!.uid);
      if (!result.ok) return errorResponse(result.error, 500);
      return successResponse(result.data, result.data.liked ? "Liked" : "Unliked");
    },
  }),
);

export const GET = __GET__g;
export const POST = __POST__g;
