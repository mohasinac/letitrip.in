import { withFeatureGuard } from "@/lib/features";
import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  assignSpinPrizeAction,
} from "@mohasinac/appkit/server";

const __POST__g = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ params, user }) => {
      const id = (params as { id: string }).id;
      if (!user?.uid) return errorResponse("Unauthorized", 401);
      const result = await assignSpinPrizeAction({
        eventId: id,
        userId: user.uid,
      });
      if (!result.ok) {
        return errorResponse(result.error, 500);
      }
      const data = result.data;
      if (data.reason && !data.spinPrizeId) {
        return errorResponse(data.reason, 409);
      }
      return successResponse(data, "Spin recorded");
    },
  }),
);

export const POST = withFeatureGuard("PRIZE_DRAWS", __POST__g);
