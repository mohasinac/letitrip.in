/**
 * Admin Order Detail API Route
 * GET    /api/admin/orders/[id] — Get single order (admin)
 * PATCH  /api/admin/orders/[id] — Update order status/tracking (admin)
 */

import { z } from "zod";
import { successResponse } from "@/lib/api-response";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { orderRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import type { OrderStatus, PaymentStatus } from "@/db/schema";
import { createApiHandler } from "@/lib/api/api-handler";
import { RateLimitPresets } from "@/lib/security/rate-limit";

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
export const GET = createApiHandler<never, IdParams>({
  roles: ["admin", "moderator"],
  rateLimit: RateLimitPresets.API,
  handler: async ({ params }) => {
    const { id } = params!;
    const order = await orderRepository.findById(id);
    if (!order) throw new NotFoundError(ERROR_MESSAGES.ORDER.NOT_FOUND);
    return successResponse(order);
  },
});

/**
 * PATCH /api/admin/orders/[id] — Update order status/tracking
 */
export const PATCH = createApiHandler<
  (typeof adminOrderUpdateSchema)["_output"],
  IdParams
>({
  roles: ["admin", "moderator"],
  rateLimit: RateLimitPresets.API,
  schema: adminOrderUpdateSchema,
  handler: async ({ user, body, params }) => {
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
