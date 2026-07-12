import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  errorResponse,
  parseJsonBody,
  successResponse,
  applyRateLimit,
} from "@mohasinac/appkit";
import { submitLotteryPullAction } from "@mohasinac/appkit/server";

// rbac-scope-enforced-in-handler: auth required; enforced inside submitLotteryPullAction
export const POST = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, request, params }) => {
      const rl = await applyRateLimit(request, { limit: 5, window: 60 });
      if (!rl.success) {
        return errorResponse("Too many requests. Please try again in a minute.", 429);
      }

      const productId = (params as { id: string }).id;
      const body = await parseJsonBody(request);

      const result = await submitLotteryPullAction({
        ...(body as Record<string, unknown>),
        sourceType: "product",
        productId,
        userId: user!.uid,
        userDisplayName: user!.displayName ?? undefined,
        userEmail: user!.email ?? undefined,
      });

      if (!result.ok) return errorResponse(result.error ?? "Failed to submit pull", 400);
      return successResponse(result.data, "Lottery pull submitted", 201);
    },
  }),
);
