import "@/providers.config";
/**
 * Admin Orders [id] API Route
 * GET   /api/admin/orders/:id — Get a single order
 * PATCH /api/admin/orders/:id — Update order status
 */

import { z } from "zod";
import { successResponse } from "@mohasinac/appkit/next";
import { orderRepository } from "@mohasinac/appkit/repositories";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import { ERROR_MESSAGES } from "@mohasinac/appkit/errors";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/values";
type RouteContext = { params: Promise<{ id: string }> };

const updateOrderSchema = z.object({
  status: z.string().optional(),
  trackingNumber: z.string().optional(),
  shiprocketOrderId: z.string().optional(),
  shiprocketShipmentId: z.string().optional(),
  trackingUrl: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id } = await context.params;
  const orders = await orderRepository.listAll({ filters: `id==${id}`, page: "1", pageSize: "1" });
  const order = orders.items[0];
  if (!order) {
    return Response.json(
      { success: false, error: ERROR_MESSAGES.ORDER.NOT_FOUND },
      { status: 404 },
    );
  }
  return Response.json({ success: true, data: order });
}

export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const parsed = updateOrderSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: parsed.error.format() },
      { status: 400 },
    );
  }

  const { status, ...rest } = parsed.data;

  serverLogger.info("Admin updating order", { id, status });

  if (status) {
    await orderRepository.updateStatus(id, status as any, { ...(rest.trackingNumber && { trackingNumber: rest.trackingNumber }), ...(rest.trackingUrl && { trackingUrl: rest.trackingUrl }), ...(rest.notes && { notes: rest.notes }) } as any);
  }

  return Response.json(successResponse({ id, status, ...rest }, SUCCESS_MESSAGES.ORDER.UPDATED));
}
