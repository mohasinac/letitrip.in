import "@/providers.config";
/**
 * Admin Event Status API Route
 * PATCH /api/admin/events/:id/status — Update event status
 */

import { z } from "zod";
import { successResponse } from "@mohasinac/appkit";
import { eventRepository } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit";
type RouteContext = { params: Promise<{ id: string }> };

const updateStatusSchema = z.object({
  status: z.enum(["draft", "published", "active", "ended", "cancelled", "paused"]),
});

export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const parsed = updateStatusSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: parsed.error.format() },
      { status: 400 },
    );
  }

  serverLogger.info("Admin updating event status", { id, status: parsed.data.status });

  await eventRepository.changeStatus(id, parsed.data.status as any);
  return Response.json(successResponse({ id, status: parsed.data.status }, SUCCESS_MESSAGES.EVENT.UPDATED));
}
