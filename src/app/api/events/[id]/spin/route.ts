import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  assignSpinPrizeAction,
} from "@mohasinac/appkit/server";

// rbac-scope-enforced-in-handler: auth and ownership enforced within handler
export const POST = withProviders(
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