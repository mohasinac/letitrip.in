/**
 * Admin Order Detail API Route
 * GET    /api/admin/orders/[id] — Get single order (admin)
 * PATCH  /api/admin/orders/[id] — Update order status/tracking (admin)
 */

import { z } from "zod";
import { successResponse, errorResponse } from "@/lib/api-response";
import { NotFoundError, ValidationError } from "@mohasinac/appkit/errors";
import { orderRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import type { OrderStatus, PaymentStatus } from "@/db/schema";
import { createApiHandler as createRouteHandler } from "@/lib/api/api-handler";
import { applyRateLimit, RateLimitPresets } from "@mohasinac/appkit/security";

type IdParams = { id: string };

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

const ADMIN_ORDER_ALLOWED_FIELDS = [
  "status",
  "paymentStatus",
  "trackingNumber",
  "notes",
  "cancellationReason",
  "shippingDate",
  "deliveryDate",
] as const;

const adminOrderUpdateSchema = z.object({
  status: z
    .enum([
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
      "returned",
    ])
    .optional(),
  paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
  cancellationReason: z.string().optional(),
  shippingDate: z.coerce.date().optional(),
  deliveryDate: z.coerce.date().optional(),
});

/**
 * GET /api/admin/orders/[id]
 */
export const GET = createRouteHandler<never, IdParams>({
  roles: ["admin", "moderator"],
  handler: async ({ request, params }) => {
    const rl = await applyRateLimit(request, RateLimitPresets.API);
    if (!rl.success) return errorResponse("Too many requests", 429);
    const { id } = params!;
    const order = await orderRepository.findById(id);
    if (!order) throw new NotFoundError(ERROR_MESSAGES.ORDER.NOT_FOUND);
    return successResponse(order);
  },
});

/**
 * PATCH /api/admin/orders/[id] — Update order status/tracking
 */
export const PATCH = createRouteHandler<
  (typeof adminOrderUpdateSchema)["_output"],
  IdParams
>({
  roles: ["admin", "moderator"],
  schema: adminOrderUpdateSchema,
  handler: async ({ request, user, body, params }) => {
    const rl = await applyRateLimit(request, RateLimitPresets.API);
    if (!rl.success) return errorResponse("Too many requests", 429);
    const { id } = params!;
    const order = await orderRepository.findById(id);
    if (!order) throw new NotFoundError(ERROR_MESSAGES.ORDER.NOT_FOUND);

    const allowedUpdate: Record<string, unknown> = {};
    for (const field of ADMIN_ORDER_ALLOWED_FIELDS) {
      if (body && field in body)
        allowedUpdate[field] = body[field as keyof typeof body];
    }

    // Auto-set cancellationDate when cancelling
    if (body?.status === "cancelled" && order.status !== "cancelled") {
      allowedUpdate.cancellationDate = new Date();
    }

    const updated = await orderRepository.update(id, {
      ...allowedUpdate,
      updatedAt: new Date(),
    });
    serverLogger.info("Order updated by admin", {
      orderId: id,
      adminUid: user!.uid,
      changes: allowedUpdate,
    });
    return successResponse(updated, SUCCESS_MESSAGES.ORDER.UPDATED);
  },
});
