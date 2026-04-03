/**
 * Cancel Order API
 *
 * POST /api/user/orders/[id]/cancel
 *
 * Cancels a user order. Only orders with status "pending" or "confirmed"
 * can be cancelled by the user. Shipped/delivered orders require admin action.
 */

import { orderRepository } from "@/repositories";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { AuthorizationError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";
import { createRouteHandler } from "@mohasinac/next";
import { applyRateLimit, RateLimitPresets } from "@/lib/security/rate-limit";
import { z } from "zod";

const cancelSchema = z.object({
  reason: z.string().min(1, "Cancellation reason is required").max(500),
});

const CANCELLABLE_STATUSES = ["pending", "confirmed"] as const;

/**
 * POST /api/user/orders/[id]/cancel
 *
 * Cancels the order if it is still in a cancellable state.
 * Requires a cancellation reason in the request body.
 * Rate-limited to prevent cancel-spam attacks.
 */
export const POST = createRouteHandler<
  (typeof cancelSchema)["_output"],
  { id: string }
>({
  auth: true,
  schema: cancelSchema,
  handler: async ({ user, body, params, request }) => {
    const rl = await applyRateLimit(request, RateLimitPresets.STRICT);
    if (!rl.success) return errorResponse("Too many requests", 429);
    const { id } = params!;

    const order = await orderRepository.findById(id);

    if (!order) {
      return errorResponse(ERROR_MESSAGES.ORDER.NOT_FOUND, 404);
    }

    if (order.userId !== user!.uid) {
      throw new AuthorizationError(ERROR_MESSAGES.AUTH.ADMIN_ACCESS_REQUIRED);
    }

    if (!CANCELLABLE_STATUSES.includes(order.status as any)) {
      return errorResponse(ERROR_MESSAGES.ORDER.CANNOT_CANCEL, 422);
    }

    const reason = body?.reason ?? "Cancelled by user";

    const cancelled = await orderRepository.cancelOrder(id, reason);

    serverLogger.info("Order cancelled by user", {
      userId: user!.uid,
      orderId: id,
      reason,
    });

    return successResponse(cancelled, SUCCESS_MESSAGES.ORDER.CANCELLED);
  },
});
