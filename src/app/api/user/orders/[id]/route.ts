import { withProviders } from "@/providers.config";
import {
  getOrderByIdForUser,
  createRouteHandler,
  successResponse,
  errorResponse,
} from "@mohasinac/appkit";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, params }) => {
      const orderId = (params as { id: string }).id;
      const order = await getOrderByIdForUser(user!.uid, orderId);
      if (!order) return errorResponse("Order not found", 404);
      return successResponse(order);
    },
  }),
);
