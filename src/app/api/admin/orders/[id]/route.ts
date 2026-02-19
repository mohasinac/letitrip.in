/**
 * Admin Order Detail API Route
 * GET    /api/admin/orders/[id] — Get single order (admin)
 * PATCH  /api/admin/orders/[id] — Update order status/tracking (admin)
 */

import { NextRequest } from "next/server";
import { successResponse } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/firebase/auth-server";
import { handleApiError } from "@/lib/errors/error-handler";
import {
  AuthenticationError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import { requireRole } from "@/lib/security/authorization";
import { orderRepository, userRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import type { OrderStatus, PaymentStatus } from "@/db/schema";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];

const PAYMENT_STATUSES: PaymentStatus[] = [
  "pending",
  "paid",
  "failed",
  "refunded",
];

async function getAdminUser() {
  const authUser = await getAuthenticatedUser();
  if (!authUser)
    throw new AuthenticationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);

  const firestoreUser = await userRepository.findById(authUser.uid);
  if (!firestoreUser)
    throw new AuthenticationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);

  requireRole({ ...authUser, role: firestoreUser.role || "user" }, [
    "admin",
    "moderator",
  ] as any);
  return authUser;
}

/**
 * GET /api/admin/orders/[id]
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await getAdminUser();
    const { id } = await context.params;

    const order = await orderRepository.findById(id);
    if (!order) throw new NotFoundError(ERROR_MESSAGES.ORDER.NOT_FOUND);

    return successResponse(order);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/admin/orders/[id]
 *
 * Allowed fields: status, paymentStatus, trackingNumber, notes, cancellationReason
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const adminUser = await getAdminUser();
    const { id } = await context.params;

    const order = await orderRepository.findById(id);
    if (!order) throw new NotFoundError(ERROR_MESSAGES.ORDER.NOT_FOUND);

    const body = await request.json();

    // Validate status if provided
    if (body.status && !ORDER_STATUSES.includes(body.status)) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD);
    }

    // Validate paymentStatus if provided
    if (body.paymentStatus && !PAYMENT_STATUSES.includes(body.paymentStatus)) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD);
    }

    // Only allow safe fields for admin update
    const allowedUpdate: Record<string, unknown> = {};
    const ALLOWED_FIELDS = [
      "status",
      "paymentStatus",
      "trackingNumber",
      "notes",
      "cancellationReason",
      "shippingDate",
      "deliveryDate",
    ];
    for (const field of ALLOWED_FIELDS) {
      if (field in body) allowedUpdate[field] = body[field];
    }

    // Auto-set cancellationDate when cancelling
    if (body.status === "cancelled" && order.status !== "cancelled") {
      allowedUpdate.cancellationDate = new Date();
    }

    const updated = await orderRepository.update(id, {
      ...allowedUpdate,
      updatedAt: new Date(),
    });

    serverLogger.info("Order updated by admin", {
      orderId: id,
      adminUid: adminUser.uid,
      changes: allowedUpdate,
    });

    return successResponse(updated, SUCCESS_MESSAGES.ORDER.UPDATED);
  } catch (error) {
    return handleApiError(error);
  }
}
