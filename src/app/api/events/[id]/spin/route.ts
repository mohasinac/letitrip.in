import { withFeatureGuard } from "@/lib/features";
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
const SPIN_REASON_STATUS: Record<string, number> = {
  login_required: 401,
  identity_required: 401,
  outside_spin_window: 403,
  event_not_found: 404,
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

export const POST = withFeatureGuard("PRIZE_DRAWS", __POST__g);
