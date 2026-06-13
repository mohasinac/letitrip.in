import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  assignSpinPrizeAction,
} from "@mohasinac/appkit/server";

// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
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
      if (result.reason && !result.spinPrizeId) {
        return errorResponse(result.reason, 409);
      }
      return successResponse(result, "Spin recorded");
    },
  }),
);
