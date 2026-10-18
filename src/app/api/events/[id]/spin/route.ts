import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  assignSpinPrizeAction,
  resolveEventIdAction,
  rateLimitByIdentifier,
  hashGuestIdentity,
  getClientIP,
  reasonToHttp,
  RateLimitPresets,
} from "@mohasinac/appkit/server";

const __POST__g = withProviders(
  createRouteHandler({
    authOptional: true,
    handler: async ({ params, user, request }) => {
      const id = (params as { id: string }).id;

      /*
       * Namespaced rate-limit key. `applyRateLimit(request, …)` keys on the
       * bare client IP with no route or preset namespace, so every other STRICT
       * route drained the same 5-per-minute bucket as this one. Scoping it to
       * `event:spin:<identity>` is a local change with no blast radius — the
       * namespaced form already has ~60 call sites (`src/actions/bid.actions.ts`).
       *
       * Residual, accepted: `getClientIP` returns "unknown" when there is no
       * `x-forwarded-for`, so in local dev every guest shares one bucket.
       * Behind Vercel the header is always present.
       */
      const rl = await rateLimitByIdentifier(
        `event:spin:${user?.uid ?? getClientIP(request)}`,
        RateLimitPresets.STRICT,
      );
      if (!rl.success) return errorResponse("Too many requests", 429);

      /*
       * 🛑 Hash the guest against the resolved DOCUMENT ID, not the route param.
       *
       * Public URLs link by slug, so `id` is usually a slug — and `enterEvent`
       * hashes on the doc id. Hashing on the slug here made one guest two
       * identities on one event, which is a free reset of `spinMaxPerUser` via
       * the other URL spelling. Only signed-out callers pay the extra read.
       *
       * A null resolution is NOT answered here: the spin action owns the single
       * `event_not_found` refusal, so there is one place that decides it.
       */
      let guestIpHash: string | undefined;
      if (!user?.uid) {
        const resolved = await resolveEventIdAction(id);
        const canonicalId = resolved.ok && resolved.data ? resolved.data : id;
        guestIpHash = hashGuestIdentity(canonicalId, request);
      }

      const result = await assignSpinPrizeAction({
        eventId: id,
        userId: user?.uid,
        guestIpHash,
      });
      if (!result.ok) {
        return errorResponse(result.error, 500);
      }
      const data = result.data;
      /*
       * A reason with no prize is a refusal. Statuses and codes come from
       * `reasonToHttp`, shared with the Firebase callable handler — the two
       * used to disagree (`identity_required` 401 vs 400, and the handler had
       * no `feature_disabled` branch at all), which is Root Cause #85.
       *
       * The client resolves its copy from `code` via `toUserMessage`, which is
       * what makes "you've already used your spin" distinguishable from "the
       * window isn't open". Both used to render "Spin failed. Please try again."
       */
      if (data.reason && !data.spinPrizeId) {
        const { status, code, message } = reasonToHttp(data.reason);
        return errorResponse(message, status, { code });
      }
      return successResponse(data, "Spin recorded");
    },
  }),
);

export const POST = __POST__g;
