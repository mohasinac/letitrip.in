import { withProviders } from "@/providers.config";
import { getOrderByIdForUser } from "@mohasinac/appkit/features/orders/actions/order-actions";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { orderDocumentToOrder } from "@mohasinac/appkit";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, params }) => {
      const orderId = (params as { id: string }).id;
      const doc = await getOrderByIdForUser(user!.uid, orderId);
      if (!doc) return errorResponse("Order not found", 404);
      return successResponse(orderDocumentToOrder(doc));
    },
  }),
);