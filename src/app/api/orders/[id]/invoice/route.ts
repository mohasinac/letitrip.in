import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  orderRepository,
} from "@mohasinac/appkit";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ params, user }) => {
      const orderId = (params as { id: string }).id;
      const order = await orderRepository.findById(orderId);
      if (!order) return errorResponse("Order not found", 404);
      if (order.userId !== user!.uid) return errorResponse("Order not found", 404);
      return successResponse({ order });
    },
  }),
);
