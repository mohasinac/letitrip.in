/**
 * Cancel Order API
 *
 * POST /api/user/orders/[id]/cancel
 *
 * Cancels a user order. Only orders with status "pending" or "confirmed"
 * can be cancelled by the user. Shipped/delivered orders require admin action.
 */

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/firebase/auth-server";
import { orderRepository } from "@/repositories";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { AuthorizationError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";
import { z } from "zod";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const cancelSchema = z.object({
  reason: z.string().min(1, "Cancellation reason is required").max(500),
});

const CANCELLABLE_STATUSES = ["pending", "confirmed"] as const;

/**
 * POST /api/user/orders/[id]/cancel
 *
 * Cancels the order if it is still in a cancellable state.
 * Requires a cancellation reason in the request body.
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const order = await orderRepository.findById(id);

    if (!order) {
      return errorResponse(ERROR_MESSAGES.ORDER.NOT_FOUND, 404);
    }

    // Users may only cancel their own orders
    if (order.userId !== user.uid) {
      throw new AuthorizationError(ERROR_MESSAGES.AUTH.ADMIN_ACCESS_REQUIRED);
    }

    // Only allow cancellation for pending/confirmed orders
    if (!CANCELLABLE_STATUSES.includes(order.status as any)) {
      return errorResponse(ERROR_MESSAGES.ORDER.CANNOT_CANCEL, 422);
    }

    // Parse cancellation reason
    const body = await request.json().catch(() => ({}));
    const validation = cancelSchema.safeParse(body);

    const reason = validation.success
      ? validation.data.reason
      : "Cancelled by user";

    const cancelled = await orderRepository.cancelOrder(id, reason);

    serverLogger.info("Order cancelled by user", {
      userId: user.uid,
      orderId: id,
      reason,
    });

    return successResponse(cancelled, SUCCESS_MESSAGES.ORDER.CANCELLED);
  } catch (error) {
    return handleApiError(error);
  }
}
