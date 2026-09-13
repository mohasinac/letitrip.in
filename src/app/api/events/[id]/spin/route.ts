import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  assignSpinPrizeAction,
  applyRateLimit,
  hashGuestIdentity,
  RateLimitPresets,
} from "@mohasinac/appkit/server";

// Reason -> HTTP status. Anything not listed here falls back to 409
// (a benign "can't spin right now" state — already-used, no prizes, etc).
//
// 🛑 A PERMANENT REASON MUST NEVER TAKE THE 409 FALLBACK.
//
// 409 maps to code ALREADY_EXISTS, and the fallback is documented above as a *benign,
// retryable* state. `feature_disabled` is neither: assignSpinPrize returns it when
// FEATURE_PRIZE_DRAWS is not "true", which no amount of retrying changes. Left unlisted it
// produced {code:"ALREADY_EXISTS", error:"feature_disabled"} — an envelope naming two
// unrelated reasons — which the UI rendered as "Spin failed. Please try again.", inviting a
// retry that can never succeed. Found on the first spin of a virgin fixture
// (run 1789300124915); the event was Active and the Spin button enabled throughout.
//
// `no_prizes_configured` is listed for the same reason: the sibling job handler
// (appkit assignSpinPrize.ts) already maps it to 422, and this route disagreeing with it
// is the two-entry-points-one-handler drift of Root Cause #85.
const SPIN_REASON_STATUS: Record<string, number> = {
  login_required: 401,
  identity_required: 401,
  outside_spin_window: 403,
  event_not_found: 404,
  no_prizes_configured: 422,
  feature_disabled: 503,
};

const __POST__g = withProviders(
  createRouteHandler({
    authOptional: true,
    handler: async ({ params, user, request }) => {
      const rl = await applyRateLimit(request, RateLimitPresets.STRICT);
      if (!rl.success) return errorResponse("Too many requests", 429);

      const id = (params as { id: string }).id;
      const guestIpHash = user?.uid ? undefined : hashGuestIdentity(id, request);
      const result = await assignSpinPrizeAction({
        eventId: id,
        userId: user?.uid,
        guestIpHash,
      });
      if (!result.ok) {
        return errorResponse(result.error, 500);
      }
      const data = result.data;
      if (data.reason && !data.spinPrizeId) {
        return errorResponse(data.reason, SPIN_REASON_STATUS[data.reason] ?? 409);
      }
      return successResponse(data, "Spin recorded");
    },
  }),
);

export const POST = __POST__g;
