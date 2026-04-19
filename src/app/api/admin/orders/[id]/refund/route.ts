import "@/providers.config";
/**
 * Admin Orders Refund API Route
 * POST /api/admin/orders/:id/refund — Process a refund for an order
 */

import { z } from "zod";
import { successResponse } from "@mohasinac/appkit/server";
import { orderRepository } from "@mohasinac/appkit/server";
import { serverLogger } from "@mohasinac/appkit/server";
import { ERROR_MESSAGES } from "@mohasinac/appkit/server";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/server";

type RouteContext = { params: Promise<{ id: string }> };

const refundSchema = z.object({
  amount: z.number().min(0),
  reason: z.string().min(1),
});

export async function POST(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const parsed = refundSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: parsed.error.format() },
      { status: 400 },
    );
  }

  const { amount, reason } = parsed.data;

  serverLogger.info("Admin processing order refund", { id, amount, reason });

  await orderRepository.cancelOrder(id, reason, amount);

  return Response.json(successResponse({ id, amount, reason }, SUCCESS_MESSAGES.ORDER.CANCELLED));
}
