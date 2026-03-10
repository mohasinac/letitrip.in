/**
 * User Order API — Single Resource
 *
 * GET  /api/user/orders/[id] — Get a single order (auth + ownership required)
 */

import { orderRepository } from "@/repositories";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ERROR_MESSAGES } from "@/constants";
import { AuthorizationError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";
import { createApiHandler } from "@/lib/api/api-handler";
import { RateLimitPresets } from "@/lib/security/rate-limit";

export const GET = createApiHandler<never, { id: string }>({
  auth: true,
  rateLimit: RateLimitPresets.API,
  handler: async ({ user, params }) => {
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
