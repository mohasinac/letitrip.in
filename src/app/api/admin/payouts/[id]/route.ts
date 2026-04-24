import "@/providers.config";
import { PAYOUT_FIELDS } from "@/constants/field-names";
/**
 * Admin Payouts [id] API Route
 * GET   /api/admin/payouts/:id — Get a single payout
 * PATCH /api/admin/payouts/:id — Update payout status
 */

import { z } from "zod";
import { successResponse } from "@mohasinac/appkit";
import { payoutRepository } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { ERROR_MESSAGES } from "@mohasinac/appkit";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit";
type RouteContext = { params: Promise<{ id: string }> };

const updatePayoutSchema = z.object({
  status: z.enum(Object.values(PAYOUT_FIELDS.STATUS_VALUES) as [string, ...string[]]),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id } = await context.params;
  const payouts = await payoutRepository.list({ filters: `id==${id}`, page: "1", pageSize: "1" });
  const payout = payouts.items[0];
  if (!payout) {
    return Response.json(
      { success: false, error: ERROR_MESSAGES.PAYOUT.NOT_FOUND },
      { status: 404 },
    );
  }
  return Response.json({ success: true, data: payout });
}

export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const parsed = updatePayoutSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: parsed.error.format() },
      { status: 400 },
    );
  }

  const { status, transactionId, notes } = parsed.data;

  serverLogger.info("Admin updating payout status", { id, status });

  await payoutRepository.updateStatus(id, status as any, {
    ...(notes && { adminNote: notes }),
  } as any);

  return Response.json(successResponse({ id, status }, SUCCESS_MESSAGES.PAYOUT.UPDATED));
}
