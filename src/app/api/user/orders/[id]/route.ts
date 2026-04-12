/**
 * User Order API — Single Resource
 *
 * GET  /api/user/orders/[id] — Get a single order (auth + ownership required)
 */

import { orderRepository } from "@/repositories";
import { successResponse, errorResponse } from "@mohasinac/appkit/next";
import { ERROR_MESSAGES } from "@/constants";
import { AuthorizationError } from "@mohasinac/appkit/errors";
import { serverLogger } from "@/lib/server-logger";
import { createRouteHandler } from "@mohasinac/appkit/next";
import { RateLimitPresets, applyRateLimit } from "@mohasinac/appkit/security";

export const GET = createRouteHandler<never, { id: string }>({
  auth: true,
  handler: async ({ request, user, params }) => {
    const rl = await applyRateLimit(request, RateLimitPresets.API);
    if (!rl.success) return errorResponse("Too many requests", 429);
    const { id } = params!;

    const order = await orderRepository.findById(id);
    if (!order) return errorResponse(ERROR_MESSAGES.ORDER.NOT_FOUND, 404);

    if (order.userId !== user!.uid) {
      throw new AuthorizationError(ERROR_MESSAGES.AUTH.ADMIN_ACCESS_REQUIRED);
    }

    serverLogger.info("Order fetched", { userId: user!.uid, orderId: id });
    return successResponse(order);
  },
});
