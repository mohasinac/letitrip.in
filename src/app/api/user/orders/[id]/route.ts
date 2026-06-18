import { withProviders } from "@/providers.config";
import {
  getOrderByIdForUser,
  createRouteHandler,
  successResponse,
  errorResponse,
  orderDocumentToOrder,
} from "@mohasinac/appkit";

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
