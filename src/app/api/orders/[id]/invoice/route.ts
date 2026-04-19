import "@/providers.config";
import { createRouteHandler } from "@mohasinac/appkit/server";
import { successResponse } from "@mohasinac/appkit/server";
import { NotFoundError } from "@mohasinac/appkit/server";
import { orderRepository } from "@mohasinac/appkit/server";
import { ERROR_MESSAGES } from "@mohasinac/appkit/server";

/**
 * GET /api/orders/[id]/invoice
 *
 * Returns order details for invoice rendering.
 * Requires authentication; only the order owner may fetch their invoice.
 */
export const GET = createRouteHandler({
  auth: true,
  handler: async ({ request, user }) => {
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/");
    const orderId = pathParts[pathParts.indexOf("orders") + 1];

    if (!orderId) {
      throw new NotFoundError(ERROR_MESSAGES.ORDER.NOT_FOUND);
    }

    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError(ERROR_MESSAGES.ORDER.NOT_FOUND);
    }

    if (order.userId !== user!.uid) {
      throw new NotFoundError(ERROR_MESSAGES.ORDER.NOT_FOUND);
    }

    return successResponse({ order });
  },
});
