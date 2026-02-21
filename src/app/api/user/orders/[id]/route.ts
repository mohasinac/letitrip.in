/**
 * User Order API — Single Resource
 *
 * GET  /api/user/orders/[id]          — Get a single order
 * POST /api/user/orders/[id]/cancel   — Cancel an order (handled in sub-route)
 *
 * Users can only access their own orders.
 */

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/firebase/auth-server";
import { orderRepository } from "@/repositories";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ERROR_MESSAGES } from "@/constants";
import { AuthorizationError } from "@/lib/errors";
import { serverLogger } from "@/lib/server-logger";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/user/orders/[id]
 *
 * Returns a single order, verifying it belongs to the authenticated user.
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const order = await orderRepository.findById(id);

    if (!order) {
      return errorResponse(ERROR_MESSAGES.ORDER.NOT_FOUND, 404);
    }

    // Users may only view their own orders
    if (order.userId !== user.uid) {
      throw new AuthorizationError(ERROR_MESSAGES.AUTH.ADMIN_ACCESS_REQUIRED);
    }

    serverLogger.info("Order fetched", { userId: user.uid, orderId: id });

    return successResponse(order);
  } catch (error) {
    return handleApiError(error);
  }
}
