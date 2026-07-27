import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  errorResponse,
  parseJsonBody,
  successResponse,
} from "@mohasinac/appkit";
import { applyRateLimit, RateLimitPresets, submitLotteryPullAction } from "@mohasinac/appkit/server";

// rbac-scope-enforced-in-handler: any authenticated user may submit a lottery pull; soft-ban check inside
export const POST = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, request, params }) => {
      const rl = await applyRateLimit(request, RateLimitPresets.STRICT);
      if (!rl.success) return errorResponse("Too many requests", 429);

      const id = (params as { id: string }).id;
      const body = await parseJsonBody(request) as Record<string, unknown>;

      const result = await submitLotteryPullAction({
        sourceType: "event",
        eventId: id,
        userId: user!.uid,
        userPhone: body.userPhone,
        transactionId: body.transactionId,
        paymentTime: body.paymentTime,
        purchasedItemNumber: body.purchasedItemNumber,
      });

      if (!result.ok) return errorResponse(result.error ?? "Lottery pull failed", 400);
      return successResponse(result.data, "Slot assigned");
    },
  }),
);
